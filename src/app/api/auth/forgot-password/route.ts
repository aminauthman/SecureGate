import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { db } from "@/lib/db";

const forgotSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
});

let ratelimit: Ratelimit | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
    });
  } catch {
    // rate limiting disabled if Redis unavailable
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(`forgot-password:${ip}`);
    if (!success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString() },
        }
      );
    }
  }

  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Something went wrong. Please try again." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return the same message (enumeration mitigation)
    await db.user.findUnique({ where: { email } });

    // Generate reset token (expires in 15 min per security.md)
    const token = crypto.randomUUID();
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

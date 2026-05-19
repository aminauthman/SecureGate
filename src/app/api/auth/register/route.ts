import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter").refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter").refine((v) => /[0-9]/.test(v), "Must contain a number").refine((v) => /[^A-Za-z0-9]/.test(v), "Must contain a special character"),
});

// Initialize Upstash Redis if variables are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis rate-limiter:", error);
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting Integration (IP Target)
  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(`signup:${ip}`);
    if (!success) {
      return new NextResponse(
        JSON.stringify({ message: "Too many registration attempts. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid email or password boundaries." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Enumeration mitigation
      return new NextResponse(
        JSON.stringify({ message: "Account registration is not possible with these details." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the password with bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the user
    await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    // Generate verification token and send email
    const token = crypto.randomUUID();
    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email.toLowerCase(), token);

    // Resource cleansing: nullify references
    parsed.data.password = "";

    return new NextResponse(
      JSON.stringify({ message: "Account created successfully." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("REGISTRATION_ERROR_DIAGNOSTIC:", error);
    return new NextResponse(
      JSON.stringify({ message: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

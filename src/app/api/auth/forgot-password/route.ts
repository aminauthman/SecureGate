import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { csrfGuard } from "@/lib/csrf";
import { checkRateLimit, checkRateLimitPerEmail, getClientIp } from "@/lib/rate-limit";
import { findUserByEmail, createVerificationToken } from "@/lib/services/user";
import { sendPasswordResetEmail } from "@/lib/services/email";

const forgotSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
});

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`forgot-password:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many attempts! Try again later." },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input. Please check your entries and try again." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const emailAllowed = await checkRateLimitPerEmail("forgot-email", email);
    if (!emailAllowed.allowed) {
      return NextResponse.json(
        { message: "Too many attempts! Try again later." },
        {
          status: 429,
          headers: { "Retry-After": emailAllowed.retryAfter.toString() },
        }
      );
    }

    const user = await findUserByEmail(email);

    if (user) {
      const token = crypto.randomUUID();
      await createVerificationToken(email, token, new Date(Date.now() + 15 * 60 * 1000));
      const origin = new URL(request.url).origin;
      await sendPasswordResetEmail(email, token, origin);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

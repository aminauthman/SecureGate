import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { csrfGuard } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { findVerificationToken, resetPassword } from "@/lib/services/user";

const resetSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(12).refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter").refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter").refine((v) => /[0-9]/.test(v), "Must contain a number").refine((v) => /[^A-Za-z0-9]/.test(v), "Must contain a special character"),
});

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`reset-password:${ip}`);

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
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input. Please check your entries and try again." },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const verificationToken = await findVerificationToken(token);

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await resetPassword(verificationToken.identifier, passwordHash, verificationToken.id);

    return NextResponse.json(
      { message: "Password reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

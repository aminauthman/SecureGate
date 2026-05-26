import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";

import { csrfGuard } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { findUserByEmail, createUser, createVerificationToken } from "@/lib/services/user";
import { sendVerificationEmail } from "@/lib/services/email";

const registerSchema = z.object({
  name: z.string().min(1).max(100).transform((v) => v.trim().replace(/[<>]/g, "")),
  email: z.string().email(),
  password: z.string().min(12).refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter").refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter").refine((v) => /[0-9]/.test(v), "Must contain a number").refine((v) => /[^A-Za-z0-9]/.test(v), "Must contain a special character"),
});

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`signup:${ip}`);

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
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input. Please check your entries and try again." },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const existingUser = await findUserByEmail(email.toLowerCase());

    if (existingUser) {
      return NextResponse.json(
        { message: "This email has been taken, want to sign in?" },
        { status: 400 }
      );
    }

    const saltRounds = 14;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await createUser({ name, email: email.toLowerCase(), passwordHash });

    const token = crypto.randomBytes(32).toString("hex");
    await createVerificationToken(email.toLowerCase(), token, new Date(Date.now() + 15 * 60 * 1000));

    const origin = new URL(request.url).origin;
    const emailSent = await sendVerificationEmail(email.toLowerCase(), token, origin);

    if (!emailSent) {
      console.error("REGISTRATION EMAIL FAILED for:", email.toLowerCase(), "- check SMTP_* env vars on Vercel");
    }

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION_ERROR_DIAGNOSTIC:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

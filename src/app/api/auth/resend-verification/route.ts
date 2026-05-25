import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";

import { csrfGuard } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { findUserByEmail, deleteVerificationTokensByIdentifier, createVerificationToken } from "@/lib/services/user";
import { sendVerificationEmail } from "@/lib/services/email";

const resendSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
});

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = getClientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`resend-verification:${ip}`);

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
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input. Please check your entries and try again." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await findUserByEmail(email);

    if (user && !user.emailVerified) {
      await deleteVerificationTokensByIdentifier(email);

      const token = crypto.randomBytes(32).toString("hex");
      await createVerificationToken(email, token, new Date(Date.now() + 15 * 60 * 1000));

      await sendVerificationEmail(email, token);
    }

    return NextResponse.json(
      { message: "If an account exists, a verification link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESEND_VERIFICATION_ERROR:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

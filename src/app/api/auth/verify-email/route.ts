import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=missing-token", request.url)
    );
  }

  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid-token", request.url)
      );
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        new URL("/verify-email?error=expired-token", request.url)
      );
    }

    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.redirect(
      new URL("/verify-email?success=true", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/verify-email?error=unknown", request.url)
    );
  }
}

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default async function proxy(request: Request) {
  const token = await getToken({ req: request as any });

  if (!token) {
    return NextResponse.redirect(new URL("/auth?mode=signin", request.url));
  }

  if (!(token as { emailVerified?: string }).emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

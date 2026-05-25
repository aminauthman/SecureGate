import { NextResponse } from "next/server";

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowed = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!origin && !referer) return false;

  try {
    const allowedUrl = new URL(allowed);

    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.hostname !== allowedUrl.hostname || originUrl.port !== allowedUrl.port) return false;
    }

    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname !== allowedUrl.hostname || refererUrl.port !== allowedUrl.port) return false;
    }
  } catch {
    return false;
  }

  return true;
}

export function csrfGuard(request: Request): NextResponse | null {
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }
  return null;
}

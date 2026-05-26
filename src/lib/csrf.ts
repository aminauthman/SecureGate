import { NextResponse } from "next/server";

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowed = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!origin && !referer) return false;

  try {
    const allowedUrl = new URL(allowed);
    const allowedHosts = new Set<string>([allowedUrl.hostname]);

    // Vercel automatically sets these env vars for each deployment
    if (process.env.VERCEL_URL) allowedHosts.add(process.env.VERCEL_URL);
    if (process.env.VERCEL_BRANCH_URL) allowedHosts.add(process.env.VERCEL_BRANCH_URL);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) allowedHosts.add(process.env.VERCEL_PROJECT_PRODUCTION_URL);

    const checkUrl = (urlStr: string): boolean => {
      const url = new URL(urlStr);
      if (!allowedHosts.has(url.hostname)) return false;
      if (url.hostname === allowedUrl.hostname && url.port !== allowedUrl.port) return false;
      return true;
    };

    if (origin && !checkUrl(origin)) return false;
    if (referer && !checkUrl(referer)) return false;
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

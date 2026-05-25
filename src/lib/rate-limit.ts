import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  try {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis rate-limiter:", error);
  }
}

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; retryAfter: number }> {
  if (!ratelimit) {
    return { allowed: true, retryAfter: 0 };
  }

  try {
    const { success, reset } = await ratelimit.limit(identifier);
    if (!success) {
      return { allowed: false, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
    }
    return { allowed: true, retryAfter: 0 };
  } catch (error) {
    console.error("Rate limiter error:", error);
    return { allowed: true, retryAfter: 0 };
  }
}

export async function checkRateLimitPerEmail(identifier: string, email: string): Promise<{ allowed: boolean; retryAfter: number }> {
  return checkRateLimit(`${identifier}:${email}`);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  return "127.0.0.1";
}

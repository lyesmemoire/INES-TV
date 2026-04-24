import { Response, NextFunction } from "express";
import { AuthRequest } from "./supabaseAuth.middleware";

const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/**
 * 🛡️ Rate Limiter Middleware (Dual Key: userId:userIp)
 * Protects playlist endpoints from harvesting.
 */
export function rateLimiter(options: RateLimitOptions) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || "anon";
    const userIp = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || 
      req.socket.remoteAddress || 
      "unknown";

    // Dual key to balance between device sharing and NAT/Proxy sharing
    const key = `${userId}:${userIp}`;

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    if (entry.count >= options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "TOO_MANY_REQUESTS",
        details: `Please wait ${retryAfter}s before trying again.`,
      });
    }

    entry.count++;
    next();
  };
}

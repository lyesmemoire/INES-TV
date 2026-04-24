import type { Request, Response, NextFunction } from "express";
import cache from "../lib/cache";

type Options = {
  prefix: string;
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
};

/**
 * Rate limiter — works with Redis OR in-memory.
 * No external dependency required.
 */
export function redisRateLimit(opts: Options) {
  const ttlSeconds = Math.max(1, Math.ceil(opts.windowMs / 1000));

  return async function rateLimiter(req: any, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userId = req.user?.id || "anon";
      const keySuffix = opts.keyGenerator
        ? opts.keyGenerator(req)
        : `${userId}:${ip}`;
      const key = `${opts.prefix}:${keySuffix}`;

      // 🔑 OPS BYPASS
      const apiKey = req.headers["x-api-key"] || req.query.api_key;
      const opsKey = process.env.OPS_API_KEY;
      if (opsKey && apiKey && apiKey === opsKey) {
        return next();
      }

      const count = await cache.incr(key, ttlSeconds);

      res.setHeader("X-RateLimit-Limit", String(opts.max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, opts.max - count)));

      if (count > opts.max) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: ttlSeconds,
        });
      }
      next();
    } catch {
      next(); // Fail-open: never block traffic due to rate limiter error
    }
  };
}

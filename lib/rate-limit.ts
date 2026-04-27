import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function rateLimit(
  identifier: string,
  limit = 60,
  window = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${identifier}`

  try {
    const requests = await redis.incr(key)

    if (requests === 1) {
      await redis.expire(key, window)
    }

    const allowed = requests <= limit
    const remaining = Math.max(0, limit - requests)

    return { allowed, remaining }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Fail open - allow request if Redis fails
    return { allowed: true, remaining: limit }
  }
}

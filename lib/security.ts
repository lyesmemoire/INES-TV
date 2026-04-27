import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

/**
 * Distributed lock avec auto-release
 */
export async function acquireLock(
  key: string,
  ttl: number = 5
): Promise<boolean> {
  const lockKey = `lock:${key}`
  const lockValue = crypto.randomUUID()

  const acquired = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: ttl,
  })

  return !!acquired
}

/**
 * IP Reputation check
 */
export async function checkIPReputation(ip: string): Promise<boolean> {
  const banKey = `ban:${ip}`
  const isBanned = await redis.exists(banKey)
  return !isBanned
}

/**
 * Ban IP temporairement
 */
export async function banIP(ip: string, duration: number = 3600) {
  const banKey = `ban:${ip}`
  await redis.set(banKey, "1", { ex: duration })
}

/**
 * Detect brute force
 */
export async function detectBruteForce(
  identifier: string,
  threshold: number = 5
): Promise<boolean> {
  const key = `bruteforce:${identifier}`
  const attempts = await redis.incr(key)

  if (attempts === 1) {
    await redis.expire(key, 300) // 5 min window
  }

  return attempts > threshold
}

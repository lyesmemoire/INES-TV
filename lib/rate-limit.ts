// Rate limiter — in-memory fallback (no Redis required)

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>()

export async function rateLimit(
  identifier: string,
  limit = 60,
  window = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${identifier}`
  const now = Date.now()

  try {
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.expiresAt) {
      // First request or expired window
      rateLimitStore.set(key, { count: 1, expiresAt: now + window * 1000 })
      return { allowed: true, remaining: limit - 1 }
    }

    entry.count++
    const allowed = entry.count <= limit
    const remaining = Math.max(0, limit - entry.count)

    return { allowed, remaining }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Fail open - allow request if store fails
    return { allowed: true, remaining: limit }
  }
}

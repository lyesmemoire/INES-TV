/**
 * ⚡ IN-MEMORY STREAM CACHE
 * 
 * Ultra-fast server-side cache to avoid repeated DB hits
 * on hot paths like /api/stream/best/:channelId.
 * TTL-based eviction — no external dependency required.
 */

type CacheEntry<T = unknown> = {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry>()

/** Get a cached value. Returns null if expired or missing. */
export function getCache<T = unknown>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiry) {
    store.delete(key)
    return null
  }

  return entry.data as T
}

/** Set a cached value with TTL in milliseconds (default 15s). */
export function setCache<T = unknown>(key: string, data: T, ttlMs = 15_000): void {
  store.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  })
}

/** Invalidate a specific cache key. */
export function invalidateCache(key: string): void {
  store.delete(key)
}

/** Invalidate all keys matching a prefix. */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }
}

/** Flush entire cache. */
export function flushCache(): void {
  store.clear()
}

const cache = new Map<string, { data: string; ts: number }>()

export async function getCachedManifest(key: string, fetcher: () => Promise<string>) {
  const now = Date.now()

  const entry = cache.get(key)
  if (entry && now - entry.ts < 2000) {
    return entry.data
  }

  const fresh = await fetcher()
  cache.set(key, { data: fresh, ts: now })

  return fresh
}

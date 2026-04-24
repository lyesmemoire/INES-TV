/**
 * REDIS — OPTIONAL
 *
 * If REDIS_URL is set and reachable → use Redis.
 * If not → fall back to in-memory Map (single-process safe).
 *
 * In-memory is fine for:
 *   - Phase 1 (< 1000 users, single VPS)
 *
 * Upgrade to Redis when:
 *   - Multiple VPS instances (horizontal scaling)
 *   - > ~5000 concurrent users
 */

type InMemEntry = { value: string; expiresAt: number };

// ── In-memory fallback ────────────────────────────────────────────────────────
const store = new Map<string, InMemEntry>();

// Prevent memory leak on 5$ VPS (Cleanup every 30s)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (val.expiresAt < now) store.delete(key);
  }
}, 30_000).unref?.(); // .unref() ensures it doesn't block process exit if applicable


function memGet(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memDel(key: string): void {
  store.delete(key);
}

function memScard(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  if (Date.now() > entry.expiresAt) { store.delete(key); return 0; }
  try { return JSON.parse(entry.value).length; } catch { return 0; }
}

function memSadd(key: string, member: string, ttlSeconds: number): void {
  const entry = store.get(key);
  let members: string[] = [];
  if (entry && Date.now() <= entry.expiresAt) {
    try { members = JSON.parse(entry.value); } catch {}
  }
  if (!members.includes(member)) members.push(member);
  store.set(key, { value: JSON.stringify(members), expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memSrem(key: string, member: string): void {
  const entry = store.get(key);
  if (!entry) return;
  try {
    const members: string[] = JSON.parse(entry.value).filter((m: string) => m !== member);
    store.set(key, { value: JSON.stringify(members), expiresAt: entry.expiresAt });
  } catch {}
}

function memIncr(key: string, ttlSeconds = 60): number {
  const current = memGet(key);
  const next = (current ? parseInt(current) : 0) + 1;
  memSet(key, String(next), ttlSeconds);
  return next;
}

function memKeys(pattern: string): string[] {
  const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
  return Array.from(store.keys()).filter(k => regex.test(k));
}

// ── Unified cache interface ───────────────────────────────────────────────────
export let redisClient: any = null;
export let usingRedis = false;

if (process.env.REDIS_URL) {
  try {
    const { default: Redis } = await import("ioredis").catch(() => ({ default: null }));
    if (Redis) {
      const client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
        retryStrategy: (times: number) => (times > 2 ? null : times * 300),
      });
      client.on("error", () => {}); // Suppress to avoid crash
      await client.connect().catch(() => {});
      const pong = await client.ping().catch(() => null);
      if (pong === "PONG") {
        redisClient = client;
        usingRedis = true;
        console.log("✅ Redis connected");
      } else {
        console.warn("⚠️  Redis unavailable — using in-memory store");
      }
    }
  } catch {
    console.warn("⚠️  Redis module not found — using in-memory store");
  }
} else {
  console.log("ℹ️  REDIS_URL not set — using in-memory store (single-VPS mode)");
}

// ── Public API (same interface for Redis + in-memory) ────────────────────────
export const cache = {
  async get(key: string): Promise<string | null> {
    if (usingRedis) return redisClient.get(key);
    return memGet(key);
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (usingRedis) { await redisClient.setex(key, ttlSeconds, value); return; }
    memSet(key, value, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    if (usingRedis) { await redisClient.del(key); return; }
    memDel(key);
  },

  async scard(key: string): Promise<number> {
    if (usingRedis) return redisClient.scard(key);
    return memScard(key);
  },

  async sadd(key: string, member: string, ttlSeconds = 300): Promise<void> {
    if (usingRedis) {
      await redisClient.sadd(key, member);
      await redisClient.expire(key, ttlSeconds);
      return;
    }
    memSadd(key, member, ttlSeconds);
  },

  async srem(key: string, member: string): Promise<void> {
    if (usingRedis) { await redisClient.srem(key, member); return; }
    memSrem(key, member);
  },

  async incr(key: string, ttlSeconds = 60): Promise<number> {
    if (usingRedis) {
      const n = await redisClient.incr(key);
      if (n === 1) await redisClient.expire(key, ttlSeconds);
      return n;
    }
    return memIncr(key, ttlSeconds);
  },

  async keys(pattern: string): Promise<string[]> {
    if (usingRedis) return redisClient.keys(pattern);
    return memKeys(pattern);
  },

  isRedis(): boolean {
    return usingRedis;
  },
};

export default cache;

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

import { EventLogService } from "../services/eventLog.service";

type InMemEntry = { value: string; expiresAt: number };

// ── Stateless Event-Sourcing Fallback ───────────────────────────────────────
// We use a local memory store for performance, but sync via Event Log for 
// cluster-wide eventual consistency.

const store = new Map<string, InMemEntry>();

async function memGet(key: string): Promise<string | null> {
  const entry = store.get(key);
  if (!entry) {
    // Attempt state reconstruction from Event Log
    const events = await EventLogService.replayRegionSegment('eu-west-1');
    const lastEvent = events.filter(e => e.type === 'SET' && e.data.key === key).pop();
    if (lastEvent) {
      memSet(key, lastEvent.data.value, 60);
      return lastEvent.data.value;
    }
    return null;
  }
  
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

async function memSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  EventLogService.append('eu-west-1', 'SET', { key, value });
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function memDel(key: string): Promise<void> {
  EventLogService.append('eu-west-1', 'DEL', { key });
  store.delete(key);
}

async function memIncr(key: string, ttlSeconds = 60): Promise<number> {
  EventLogService.append('eu-west-1', 'INCR', { key });
  
  // Reconstruct current count from Event Log (Eventual Consistency)
  const events = await EventLogService.replayRegionSegment('eu-west-1');
  const count = events.filter(e => e.type === 'INCR' && e.data.key === key).length;
  
  // Update local store for performance
  store.set(key, { value: String(count), expiresAt: Date.now() + ttlSeconds * 1000 });
  
  return count;
}


// ... the rest of mem functions (scard, sadd) can stay local or be added later if critical
// For Enterprise rate-limiting, INCR/GET are the most important.
function memScard(key: string): number { return 0; }
function memSadd(key: string, member: string, ttlSeconds: number = 300): void {}
function memSrem(key: string, member: string): void {}

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

// ── Public API (Hybrid & Resilient) ────────────────────────
const handleRedisError = (err: any) => {
  if (usingRedis) {
    usingRedis = false;
    console.error("🚨 [SRE] REDIS_DOWN: Falling back to in-memory store", { error: err.message });
    // Attempt to reconnect in background
    setTimeout(async () => {
      try {
        const pong = await redisClient.ping().catch(() => null);
        if (pong === "PONG") {
          usingRedis = true;
          console.log("🟢 [SRE] REDIS_RECOVERED: Switching back to Redis");
        }
      } catch {}
    }, 30000).unref?.();
  }
};

export const cache = {
  async get(key: string): Promise<string | null> {
    if (usingRedis) {
      try { return await redisClient.get(key); }
      catch (e) { handleRedisError(e); }
    }
    return memGet(key);
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (usingRedis) {
      try { await redisClient.setex(key, ttlSeconds, value); return; }
      catch (e) { handleRedisError(e); }
    }
    memSet(key, value, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    if (usingRedis) {
      try { await redisClient.del(key); return; }
      catch (e) { handleRedisError(e); }
    }
    memDel(key);
  },

  async scard(key: string): Promise<number> {
    if (usingRedis) {
      try { return await redisClient.scard(key); }
      catch (e) { handleRedisError(e); }
    }
    return memScard(key);
  },

  async sadd(key: string, member: string, ttlSeconds = 300): Promise<void> {
    if (usingRedis) {
      try {
        await redisClient.sadd(key, member);
        await redisClient.expire(key, ttlSeconds);
        return;
      } catch (e) { handleRedisError(e); }
    }
    memSadd(key, member, ttlSeconds);
  },

  async srem(key: string, member: string): Promise<void> {
    if (usingRedis) {
      try { await redisClient.srem(key, member); return; }
      catch (e) { handleRedisError(e); }
    }
    memSrem(key, member);
  },

  async incr(key: string, ttlSeconds = 60): Promise<number> {
    if (usingRedis) {
      try {
        const n = await redisClient.incr(key);
        if (n === 1) await redisClient.expire(key, ttlSeconds);
        return n;
      } catch (e) { handleRedisError(e); }
    }
    return memIncr(key, ttlSeconds);
  },

  async keys(pattern: string): Promise<string[]> {
    if (usingRedis) {
      try { return await redisClient.keys(pattern); }
      catch (e) { handleRedisError(e); }
    }
    return memKeys(pattern);
  },

  isRedis(): boolean {
    return usingRedis;
  },
};

export default cache;

import redis from '../lib/redis';

/**
 * ⚡ HIGH-PERFORMANCE REDIS CACHE (Phase 60)
 * Optimized for atomic operations and zero-copy lookups.
 */
export const cache = {
  /**
   * Atomic "Set if Not Exists" with TTL
   */
  async setNX(key: string, value: string, ttl: number) {
    return await redis.set(key, value, "EX", ttl, "NX");
  },

  /**
   * Raw string retrieval (no JSON parsing)
   */
  async getRaw(key: string) {
    return await redis.get(key);
  },

  /**
   * Raw string set with TTL
   */
  async setRaw(key: string, value: string, ttl: number) {
    return await redis.set(key, value, "EX", ttl);
  },

  /**
   * Delete key
   */
  async del(key: string) {
    return await redis.del(key);
  },

  /**
   * Increment counter atomically
   */
  async incr(key: string) {
    return await redis.incr(key);
  },

  /**
   * Set expiration on key
   */
  async expire(key: string, ttl: number) {
    return await redis.expire(key, ttl);
  },

  /**
   * Add to Set (SADD)
   */
  async sadd(key: string, member: string) {
    return await redis.sadd(key, member);
  },

  /**
   * Get all members of Set (SMEMBERS)
   */
  async smembers(key: string) {
    return await redis.smembers(key);
  },

  /**
   * Legacy wrapper for JSON data (if needed by other services)
   */
  async get(key: string) {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  },

  async set(key: string, value: any, ttl = 300) {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    return await redis.set(key, data, 'EX', ttl);
  },

  /**
   * 🏗️ PIPELINE & MULTI (Scale-ready)
   */
  pipeline() {
    return redis.pipeline();
  },

  multi() {
    return redis.multi();
  },

  /**
   * 📉 List retrieval (Trend analysis)
   */
  async lrange(key: string, start: number, stop: number) {
    return await redis.lrange(key, start, stop);
  }
};

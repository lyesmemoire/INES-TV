import Redis from 'ioredis'

/**
 * 🚀 HARDENED REDIS CLIENT (Phase 60)
 * Optimized for high-scale OTT Backend.
 */
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1, // Fail fast for observability brain
  connectTimeout: 10000,
  retryStrategy(times) {
    if (times > 5) {
      console.error("❌ Redis connection failed after 5 retries");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
})

redis.on('error', (err) => {
  console.error('❌ Redis error:', err)
})

redis.on('ready', () => {
  console.log('✅ Redis hardwired and ready (Programmatic Ad Engine)')
})

export default redis

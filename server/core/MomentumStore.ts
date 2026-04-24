import { redisClient, usingRedis } from "../lib/cache.js";

/**
 * 📁 /server/core/MomentumStore.ts
 * Industrial Shared Truth Persistence.
 * Layers:
 * 1. HASH   -> Current state (O(1))
 * 2. LIST   -> Historical timeline (10-min sparkline)
 * 3. ZSET   -> Global Feed Ranking (Weighted scores)
 * 4. STREAM -> Event Audit / Real-time sync
 */
export class MomentumStore {
  /**
   * ⚡ PUSH STATE
   * Updates all persistence layers atomically via Pipeline.
   */
  static async pushPoint(matchId: string, data: {
    intensity: number;
    pressure: number;
    score: string;
    tierWeight: number;
  }) {
    const rankingScore = data.pressure * data.tierWeight;

    if (usingRedis && redisClient) {
      const pipe = redisClient.pipeline();

      // HASH: Instant access
      pipe.hset(`match:${matchId}:state`, {
        intensity: data.intensity,
        pressure: data.pressure,
        score: data.score,
        ts: Date.now()
      });

      // LIST: Trend history (Keep last 20 points)
      pipe.lpush(`match:${matchId}:timeline`, data.intensity);
      pipe.ltrim(`match:${matchId}:timeline`, 0, 19);

      // ZSET: Feed Rank
      pipe.zadd("feed:ranking", rankingScore, matchId);

      // STREAM: Immutable event trail
      pipe.xadd(`match:${matchId}:events`, "*", "val", data.intensity, "p", data.pressure);

      await pipe.exec();
    } else {
      // Memory fallback for local dev
      this.memoryFallback.set(matchId, { ...data, rankingScore, ts: Date.now() });
    }
  }

  /**
   * 🏆 GET RANKED IDS
   */
  static async getRankedIds(limit = 20): Promise<string[]> {
    if (usingRedis && redisClient) {
      return redisClient.zrevrange("feed:ranking", 0, limit - 1);
    }
    return Array.from(this.memoryFallback.keys());
  }

  /**
   * 📈 GET HISTORY (Sparkline)
   */
  static async getHistory(matchId: string): Promise<number[]> {
    if (usingRedis && redisClient) {
      const raw = await redisClient.lrange(`match:${matchId}:timeline`, 0, 19);
      return raw.reverse().map((v: string) => parseFloat(v));
    }
    return [];
  }

  /**
   * 🏥 UPDATE LAST SEEN (DB Sync)
   */
  static async updateLastSeenDB(matchId: string) {
    try {
      const { prisma } = await import("../services/db.js");
      await prisma.channel.update({
        where: { id: matchId },
        data: { lastSeenAt: new Date() }
      });
    } catch (e) {
      // Non-critical health failure
    }
  }

  // Fallback map for environments without Redis
  private static memoryFallback = new Map<string, any>();
}

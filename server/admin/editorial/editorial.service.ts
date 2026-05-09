import { prisma } from "../../services/db.js";
import { redisClient, usingRedis } from "../../lib/cache.js";

const FEATURED_CACHE_KEY = "system:editorial:featured";
const REFRESH_LOCK_KEY = "system:editorial:refreshing";

/**
 * 🏟️ EDITORIAL SERVICE (Elite v1.2 Hardening)
 * Features Stale-While-Revalidate (SWR) caching for maximum availability.
 */
export class EditorialService {
  /**
   * 🏆 PIN TO HOME (FEATURED)
   */
  static async featureMatch(channelId: string, position: number) {
    const res = await prisma.featuredMatch.upsert({
      where: { channelId },
      update: { position },
      create: { channelId, position }
    });

    if (usingRedis && redisClient) {
      await redisClient.del(FEATURED_CACHE_KEY);
    }
    
    return res;
  }

  /**
   * ❌ REMOVE PIN
   */
  static async unfeatureMatch(channelId: string) {
    const res = await prisma.featuredMatch.deleteMany({
      where: { channelId }
    });

    if (usingRedis && redisClient) {
      await redisClient.del(FEATURED_CACHE_KEY);
    }

    return res;
  }

  /**
   * 📋 GET CURRENT HERO SLOTS (Elite SWR Pattern)
   */
  static async getFeaturedMatches() {
    if (!usingRedis || !redisClient) {
      return this.rebuildCache();
    }

    const cached = await redisClient.get(FEATURED_CACHE_KEY);

    if (cached) {
      // 🧠 SWR: Serve Stale, Revalidate in Background
      this.refreshCacheInBackground().catch(e => 
        console.error("[SWR] Fatal Background Revalidation Failure", e)
      );
      return JSON.parse(cached);
    }

    // 🏗️ Cold Start Lock
    return await this.rebuildCache();
  }

  /**
   * 🔄 BACKGROUND REVALIDATION (Non-blocking)
   */
  private static async refreshCacheInBackground() {
    if (!usingRedis || !redisClient) return;

    // 🛡️ Distributed Refresh Lock (avoids thundering herd on revalidation)
    const isRefreshing = await redisClient.get(REFRESH_LOCK_KEY);
    if (isRefreshing) return;

    try {
      await redisClient.set(REFRESH_LOCK_KEY, "1", "EX", 10); // 10s backpressure

      const data = await this.rebuildCache();
      
      const jitterTTL = 20 + Math.floor(Math.random() * 10);
      await redisClient.set(FEATURED_CACHE_KEY, JSON.stringify(data), "EX", jitterTTL);
    } catch (e) {
      // 📊 Audit Log failure but don't crash the request
      await redisClient.xadd("audit:swr", "*", 
        "event", "SWR_REFRESH_FAILED",
        "error", String(e),
        "timestamp", Date.now().toString()
      );
    } finally {
      await redisClient.del(REFRESH_LOCK_KEY);
    }
  }

  /**
   * 🏗️ REBUILD CACHE (Internal)
   */
  static async rebuildCache() {
    return prisma.featuredMatch.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ],
        channel: {
          isActive: true,
          deletedAt: null,
          status: { not: "FINISHED" }
        }
      },
      include: { channel: true },
      orderBy: { position: "asc" },
      take: 3
    });
  }

  /**
   * 📡 ADD DISTRIBUTION CHANNEL
   */
  static async addStream(channelId: string, type: string, url: string) {
    return prisma.stream.create({
      data: { channelId, type, url }
    });
  }

  /**
   * 📺 GET AVAILABLE STREAMS
   */
  static async getStreams(channelId: string) {
    return prisma.stream.findMany({
      where: { channelId, isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * 🧹 CRON: CLEANUP FINISHED HEROES
   */
  static async cleanupFinishedMatches() {
    console.log("[Editorial] Running automated cleanup...");
    const res = await prisma.featuredMatch.deleteMany({
      where: {
        OR: [
           { channel: { status: "FINISHED" } },
           { expiresAt: { lt: new Date() } }
        ]
      }
    });

    if (usingRedis && redisClient && res.count > 0) {
      await redisClient.del(FEATURED_CACHE_KEY);
    }

    return res;
  }
}

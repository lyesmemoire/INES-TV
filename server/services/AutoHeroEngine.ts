// server/services/AutoHeroEngine.ts

import { redisClient, usingRedis } from "../lib/cache.js";
import { MomentumSnapshot } from "./MomentumEngine.js";

const MAX_HERO = 3;

export class AutoHeroEngine {
  
  async evaluate(snapshots: MomentumSnapshot[]) {
    const heroes: string[] = [];

    // Fallback if no redis
    if (!usingRedis || !redisClient) return heroes;

    for (const snap of snapshots) {
      if (
        snap.predictedTransition === "HOT" &&
        snap.heatAcceleration > 0.25 &&
        snap.confidence > 0.65
      ) {
        const allowed = await this.acquireCooldown(snap.channelId);
        if (allowed) heroes.push(snap.channelId);
      }

      if (heroes.length >= MAX_HERO) break;
    }

    if (heroes.length > 0) {
        // Here we use the actual Redis client casted to any to use `set` easily
        await (redisClient as any).set(
          "auto:heroes",
          JSON.stringify(heroes),
          "EX",
          60
        );
    }

    return heroes;
  }

  private async acquireCooldown(channelId: string) {
    if (!usingRedis || !redisClient) return true;
    
    try {
        const key = `hero:${channelId}`;
        const res = await (redisClient as any).set(key, "1", "EX", 60, "NX");
        return res === "OK";
    } catch {
        return true;
    }
  }
}

export const autoHeroEngine = new AutoHeroEngine();

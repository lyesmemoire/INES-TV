// server/services/PanicEngine.ts

import { redisClient, usingRedis } from "../lib/cache.js";

type PanicMode = "NONE" | "LIGHT" | "EXTREME";

export class PanicEngine {
  async evaluate() {
    if (!usingRedis || !redisClient) return "NONE";
    
    try {
      const metrics = await this.getMetrics();

      const failoverRate = metrics.failoverRate;
      const avgConfidence = metrics.avgConfidence;
      const activeStreams = metrics.activeStreams;

      let mode: PanicMode = "NONE";

      if (failoverRate > 0.5 || avgConfidence < 0.25) {
        mode = "EXTREME";
      } else if (failoverRate > 0.3 || avgConfidence < 0.4) {
        mode = "LIGHT";
      }

      await this.apply(mode, metrics);

      return mode;
    } catch {
      return "NONE";
    }
  }

  private async getMetrics() {
    const data = await (redisClient as any).hgetall("ops:metrics");

    return {
      failoverRate: Number(data.failover_rate || 0),
      avgConfidence: Number(data.avg_confidence || 1),
      activeStreams: Number(data.active_streams || 0),
    };
  }

  private async apply(mode: PanicMode, metrics: any) {
    const current = await (redisClient as any).get("panic:mode");

    if (current === mode) return;

    await (redisClient as any).set("panic:mode", mode);

    try {
        await (redisClient as any).xadd(
          "panic:audit",
          "*",
          "mode",
          mode,
          "failoverRate",
          metrics.failoverRate.toString(),
          "avgConfidence",
          metrics.avgConfidence.toString(),
          "activeStreams",
          metrics.activeStreams.toString()
        );
    } catch {
       // xadd might fail if the redis version is too old or disabled
    }

    // flags globaux
    if (mode === "LIGHT") {
      await (redisClient as any).hset("flags", "ads_enabled", "0");
    }

    if (mode === "EXTREME") {
      await (redisClient as any).hset("flags", "ads_enabled", "0");
      await (redisClient as any).hset("flags", "socket_enabled", "0");
    }
  }
}

export const panicEngine = new PanicEngine();

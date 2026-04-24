import { redisClient, usingRedis } from "../../lib/cache.js";

/**
 * 📊 OPS METRICS (Industrial Grade)
 * Redis-based real-time observability for incident detection.
 */
export class OpsMetrics {
  private static METRICS_KEY = "system:ops:metrics";

  /**
   * 📈 TRACK EVENT
   */
  static async track(event: string, value: number = 1) {
    if (usingRedis && redisClient) {
      await redisClient.hincrby(this.METRICS_KEY, event, value);
      
      // 📡 TELEMETRY STREAM (Audit-Fidelity)
      if (event === "failover" || event === "circuit_breaker_triggered") {
        await redisClient.xadd("ops:telemetry", "MAXLEN", "~", "10000", "*",
          "event", event,
          "timestamp", Date.now().toString()
        );
      }
    }
  }

  /**
   * 📋 GET CURRENT METRICS
   */
  static async getMetrics() {
    if (usingRedis && redisClient) {
      return await redisClient.hgetall(this.METRICS_KEY);
    }
    return {};
  }

  /**
   * 🧹 RESET METRICS
   */
  static async reset() {
    if (usingRedis && redisClient) {
      await redisClient.del(this.METRICS_KEY);
    }
  }
}

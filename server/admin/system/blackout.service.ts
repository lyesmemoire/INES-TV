import { redisClient, usingRedis } from "../../lib/cache.js";

/**
 * 🚨 BLACKOUT SERVICE (Panic Mode Control Plane)
 * Hybrid Modes:
 * - NORMAL: System operates normally.
 * - LIGHT: Ads are disabled, Sockets are active.
 * - EXTREME: Ads disabled, Sockets disabled (Incident Mode).
 */
export type BlackoutMode = "NORMAL" | "LIGHT" | "EXTREME";

const REDIS_KEY = "system:blackout:mode";

export class BlackoutService {
  /**
   * 🛡️ GET CURRENT STATE
   */
  static async getMode(): Promise<BlackoutMode> {
    if (usingRedis && redisClient) {
      const mode = await redisClient.get(REDIS_KEY);
      return (mode as BlackoutMode) || "NORMAL";
    }
    return (this.memoryFallback as BlackoutMode) || "NORMAL";
  }

  /**
   * 🔴 SET PANIC MODE
   */
  static async setMode(mode: BlackoutMode) {
    console.log(`[Blackout] 🚨 System transition to: ${mode}`);
    if (usingRedis && redisClient) {
      await redisClient.set(REDIS_KEY, mode);
      
      // 📊 FORENSIC AUDIT (XADD)
      await redisClient.xadd("panic:audit", "MAXLEN", "~", "5000", "*", 
        "type", "PANIC_MODE_TRANSITION",
        "mode", mode,
        "timestamp", Date.now().toString(),
        "level", mode === "EXTREME" ? "CRITICAL" : mode === "LIGHT" ? "WARNING" : "INFO"
      );
    } else {
      this.memoryFallback = mode;
    }
  }

  /**
   * 💰 SHOULD BLOCK ADS?
   */
  static async shouldBlockAds(): Promise<boolean> {
    const mode = await this.getMode();
    return mode === "LIGHT" || mode === "EXTREME";
  }

  /**
   * 📡 SHOULD BLOCK SOCKETS?
   */
  static async shouldBlockSockets(): Promise<boolean> {
    const mode = await this.getMode();
    return mode === "EXTREME";
  }

  private static memoryFallback: string = "NORMAL";
}

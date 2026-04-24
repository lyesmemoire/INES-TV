import { redisClient, usingRedis } from "../../lib/cache.js";

/**
 * 🚦 FEATURE FLAGS (Control Room Mode)
 * Real-time toggles for infrastructure and business logic.
 * Features audited changes for mission-critical traceability.
 */
export class FeatureFlags {
  private static PREFIX = "system:flag:";

  /**
   * 🔍 CHECK IF ENABLED
   */
  static async isEnabled(flag: string): Promise<boolean> {
    if (usingRedis && redisClient) {
      const value = await redisClient.get(`${this.PREFIX}${flag}`);
      // Default to "1" (enabled) for most flags unless explicitly disabled
      return value !== "0";
    }
    return true; // Memory fallback: enabled
  }

  /**
   * 🟢 ENABLE FLAG
   */
  static async enable(flag: string, actor: string = "system") {
    await this.setFlag(flag, "1", actor);
  }

  /**
   * 🔴 DISABLE FLAG
   */
  static async disable(flag: string, actor: string = "system") {
    await this.setFlag(flag, "0", actor);
  }

  /**
   * ⚙️ SET FLAG (Internal with Audit)
   */
  private static async setFlag(flag: string, value: string, actor: string) {
    if (usingRedis && redisClient) {
      const oldVal = await redisClient.get(`${this.PREFIX}${flag}`);
      await redisClient.set(`${this.PREFIX}${flag}`, value);

      // 🧾 AUDIT LOG (Mandatory for Compliance)
      await redisClient.xadd("panic:audit", "MAXLEN", "~", "5000", "*",
        "type", "FEATURE_FLAG_CHANGE",
        "flag", flag,
        "oldValue", oldVal || "1",
        "newValue", value,
        "actor", actor,
        "timestamp", Date.now().toString()
      );
    }
  }
}

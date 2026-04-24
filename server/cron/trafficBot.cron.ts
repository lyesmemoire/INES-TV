import cron from "node-cron";

/**
 * 🤖 Traffic Bot Scheduler
 * Stub — Phase 2 will simulate synthetic traffic for load testing.
 */
export function startTrafficBotScheduler() {
  cron.schedule("*/30 * * * *", async () => {
    console.log("[TrafficBot] Synthetic warmup tick (stub — no-op)");
  });
  console.log("[TrafficBot] Scheduler registered (every 30m).");
}

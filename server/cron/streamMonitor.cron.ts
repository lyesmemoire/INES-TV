import cron from "node-cron";

/**
 * 🏥 Stream Monitor
 * Stub — Phase 2 will ping active stream sources and flag dead ones.
 */
export function startStreamMonitor() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("[StreamMonitor] Stream health ping (stub — no-op)");
  });
  console.log("[StreamMonitor] Monitor registered (every 5m).");
}

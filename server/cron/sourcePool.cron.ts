import cron from "node-cron";

/**
 * 🏊 Source Pool Scheduler
 * Stub — Phase 2 will auto-discover and rotate stream sources.
 */
export function startSourcePoolScheduler() {
  cron.schedule("*/15 * * * *", async () => {
    console.log("[SourcePool] Source health rotation check (stub — no-op)");
  });
  console.log("[SourcePool] Scheduler registered (every 15m).");
}

import cron from "node-cron";

/**
 * 🔭 Discovery Scheduler
 * Stub — Phase 2 will crawl open IPTV indexes.
 */
export function startDiscoveryScheduler() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[Discovery] Nightly source discovery (stub — no-op)");
  });
  console.log("[Discovery] Scheduler registered (daily 02:00).");
}

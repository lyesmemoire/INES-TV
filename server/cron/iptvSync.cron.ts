import cron from "node-cron";

/**
 * 📡 IPTV Sync Scheduler
 * Stub — Phase 2 will sync external M3U playlists on a schedule.
 */
export function startIptvSyncScheduler() {
  cron.schedule("0 */6 * * *", async () => {
    console.log("[IptvSync] Scheduled M3U refresh (stub — no-op)");
  });
  console.log("[IptvSync] Scheduler registered (every 6h).");
}

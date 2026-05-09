import { syncMatchStatusFromAPI } from '../src/lib/footballService';

async function main() {
  console.log("🚀 Starting manual match sync...");
  try {
    await syncMatchStatusFromAPI();
    console.log("✅ Sync completed successfully.");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
}

main();

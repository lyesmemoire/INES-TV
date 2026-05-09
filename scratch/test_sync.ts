import { syncMatchStatusFromAPI } from '../src/lib/footballService';

async function main() {
  console.log("Running manual sync test...");
  const result = await syncMatchStatusFromAPI();
  console.log("Sync result:", result);
}

main().catch(console.error);

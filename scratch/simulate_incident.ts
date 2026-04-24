import { updateSourceHealth } from "../server/services/noc.service";

console.log("\n🚀 [SIMULATION] STARTING CLUSTER INCIDENT...");

async function simulate() {
  console.log("1/3: Source latency detected...");
  updateSourceHealth("CDN-PARIS-01", false);
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("2/3: Packet loss increasing...");
  updateSourceHealth("CDN-PARIS-01", false);
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("3/3: BGP Session Lost. Triggering CRITICAL Alert...");
  updateSourceHealth("CDN-PARIS-01", false);
  
  console.log("\n✅ [SIMULATION] Incident injected. Look for the 🟠 [ALERT] in your main server console.");
}

simulate().catch(err => console.error("Sim tool error:", err.message));

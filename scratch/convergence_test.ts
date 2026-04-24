import { MarketSimulator } from '../server/services/marketSimulator.service.js';
import { EconomicAutopilot } from '../server/services/economicPilot.service.js';
import { ShadowAuctionRunner, comparisonEngine } from '../server/services/shadowMode.service.js';
import { yieldSegmentStore } from '../server/services/yieldSegmentStore.js';
import { yieldMemoryStore } from '../server/services/yieldMemoryStore.js';
import { AdBrain, BidContext } from '../server/services/adBrain.service.js';

async function runConvergenceTest() {
  console.log("🔥 [ConvergenceTest] Starting Self-Learning Pilot Validation...");
  
  EconomicAutopilot.start();

  const US_PREMIUM: BidContext = {
    userId: 'u1', tenantId: 't1', geo: 'US', segment: 'PREMIUM', device: 'DESKTOP', qoeScore: 0.9, trustScore: 1.0
  };

  // 📈 STAGE 1: Stable HIGH Demand (Observe Convergence)
  console.log("\n📈 [Stage 1] Stable High Demand (Pressure: 2.5)...");
  console.log("Expected: Multiplier should climb and then stabilize (asymptotic).");
  
  for(let tick=0; tick<5; tick++) {
    for(let i=0; i<100; i++) {
        const bidders = MarketSimulator.getBidders(2.5);
        const res = AdBrain.runAuction(US_PREMIUM, bidders);
        ShadowAuctionRunner.trigger(US_PREMIUM, bidders, res);
        AdBrain.releaseResult(res);
    }
    await new Promise(r => setTimeout(r, 6000)); // Wait for pilot tick
    console.log(`⏱️ Tick ${tick+1} - US Geo Multiplier: ${yieldSegmentStore.get('geo', 'US').toFixed(4)}`);
  }

  // ⚠️ STAGE 2: Market Chaos (Observe Variance Guard)
  console.log("\n🧪 [Stage 2] Market Chaos (Simulating High Variance)...");
  console.log("Expected: Memory updates should stop, preventing poisoning.");
  for(let i=0; i<200; i++) {
     // Mixture of high and low results to spike variance
     const pressure = Math.random() > 0.5 ? 5.0 : 0.1;
     const bidders = MarketSimulator.getBidders(pressure);
     const res = AdBrain.runAuction(US_PREMIUM, bidders);
     ShadowAuctionRunner.trigger(US_PREMIUM, bidders, res);
     AdBrain.releaseResult(res);
  }
  await new Promise(r => setTimeout(r, 6000));
  console.log(`⏱️ Post-Chaos - US Geo Multiplier: ${yieldSegmentStore.get('geo', 'US').toFixed(4)}`);

  // 📉 STAGE 3: Traffic Stop (Observe Decay)
  console.log("\n📉 [Stage 3] Traffic Stop (Observe Soft Decay)...");
  console.log("Expected: BestMultiplier should slowly decrease.");
  
  const beforeDecay = yieldMemoryStore.getBestMultiplier('geo:US') || 1.0;
  console.log(`⚖️ Best Multiplier before decay: ${beforeDecay.toFixed(4)}`);
  
  console.log("⏱️ Waiting for Decay cycle (20s)...");
  await new Promise(r => setTimeout(r, 20000));
  
  const afterDecay = yieldMemoryStore.getBestMultiplier('geo:US') || 1.0;
  console.log(`⚖️ Best Multiplier after decay: ${afterDecay.toFixed(4)}`);

  if (afterDecay < beforeDecay) {
    console.log("\n✅ VERDICT: CONVERGENCE & DECAY VERIFIED");
  } else {
    console.log("\n⚠️ VERDICT: DECAY NOT OBSERVED (Freshness window issue?)");
  }

  EconomicAutopilot.stop();
  process.exit(0);
}

runConvergenceTest().catch(console.error);

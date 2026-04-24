import { MarketSimulator } from '../server/services/marketSimulator.service.js';
import { EconomicAutopilot } from '../server/services/economicPilot.service.js';
import { ShadowAuctionRunner, comparisonEngine } from '../server/services/shadowMode.service.js';
import { YieldControlEngine } from '../server/services/yieldControlEngine.js';
import { AdBrain } from '../server/services/adBrain.service.js';
import { performance } from 'node:perf_hooks';

const CONTEXT = {
  userId: 'stress_test_user',
  tenantId: 'tenant_1',
  geo: 'US' as any,
  segment: 'PREMIUM' as any,
  qoeScore: 0.95,
  trustScore: 1.0
};

async function runMarketStressTest() {
  console.log("🔥 [StressTest] Starting Adaptive Yield Pilot Validation...");
  
  // 1. ENGAGE PILOT
  EconomicAutopilot.start();

  // 2. STAGE 1: STABLE HIGH DEMAND
  console.log("\n📈 [Stage 1] Simulating High Market Demand (Pressure: 2.0)...");
  MarketSimulator.setMarketPressure(2.0);
  
  for(let i=0; i<200; i++) {
    const bidders = MarketSimulator.getBidders();
    const res = AdBrain.runAuction(CONTEXT, bidders);
    ShadowAuctionRunner.trigger(CONTEXT, bidders, res);
    AdBrain.releaseResult(res);
  }
  
  // Wait for Autopilot Tick
  console.log("⏱️ Waiting for Autopilot tick (5s)...");
  await new Promise(r => setTimeout(r, 6000));
  
  let report = comparisonEngine.report();
  console.log(`📊 Report: Confidence=${report.confidenceScore}, Delta=${report.relativeYieldDelta}`);
  console.log(`⚖️ Current Floor Multiplier: ${YieldControlEngine.getFloorMultiplier().toFixed(3)}`);

  // 3. STAGE 2: ADAPTIVE INCREASE
  console.log("\n📈 [Stage 2] Running another batch to see further adaptation...");
  for(let i=0; i<300; i++) {
    const bidders = MarketSimulator.getBidders();
    const res = AdBrain.runAuction(CONTEXT, bidders);
    ShadowAuctionRunner.trigger(CONTEXT, bidders, res);
    AdBrain.releaseResult(res);
  }
  await new Promise(r => setTimeout(r, 6000));
  console.log(`⚖️ Current Floor Multiplier: ${YieldControlEngine.getFloorMultiplier().toFixed(3)}`);

  // 4. STAGE 3: CHAOS & INSTABILITY (Safety Check)
  console.log("\n🚨 [Stage 3] Simulating Extreme Market Volatility (Confidence Drop)...");
  
  // To trigger a rollback, we simulate a condition where shadow and prod diverge wildly
  for(let i=0; i<200; i++) {
    const bidders = MarketSimulator.getBidders();
    const res = AdBrain.runAuction(CONTEXT, bidders);
    
    // Simulating a shadow engine failure: Shadow randomly loses matches that Prod wins
    if (Math.random() > 0.5) {
       ShadowAuctionRunner.trigger(CONTEXT, bidders, res);
    } else {
       // Shadow reports partial failure/random results
       comparisonEngine.compare(res, { price: 0, bidderId: null, isFallback: true } as any);
    }
    AdBrain.releaseResult(res);
  }

  console.log("⏱️ Waiting for Autopilot safety check...");
  await new Promise(r => setTimeout(r, 6000));
  
  const finalFloor = YieldControlEngine.getFloorMultiplier();
  console.log(`⚖️ Final Floor Multiplier: ${finalFloor.toFixed(3)}`);
  
  if (finalFloor === 1.0) {
    console.log("\n✅ VERDICT: ADAPTIVE PILOT SECURE (Rollback Verified)");
  } else {
    console.log("\n❌ VERDICT: SAFETY SYSTEM FAILED TO ROLLBACK");
    process.exit(1);
  }

  EconomicAutopilot.stop();
  process.exit(0);
}

runMarketStressTest().catch(console.error);

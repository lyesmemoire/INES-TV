import { MarketSimulator } from '../server/services/marketSimulator.service.js';
import { EconomicAutopilot } from '../server/services/economicPilot.service.js';
import { ShadowAuctionRunner, comparisonEngine } from '../server/services/shadowMode.service.js';
import { yieldSegmentStore } from '../server/services/yieldSegmentStore.js';
import { AdBrain, BidContext } from '../server/services/adBrain.service.js';

async function runSegmentedMarketTest() {
  console.log("🔥 [SegmentedTest] Starting Multi-Dimensional Yield Validation...");
  
  EconomicAutopilot.start();

  const US_PREMIUM: BidContext = {
    userId: 'u1', tenantId: 't1', geo: 'US', segment: 'PREMIUM', device: 'DESKTOP', qoeScore: 0.9, trustScore: 1.0
  };

  const EU_LOW: BidContext = {
    userId: 'u2', tenantId: 't1', geo: 'EU', segment: 'LOW', device: 'MOBILE', qoeScore: 0.5, trustScore: 1.0
  };

  // 📈 STAGE 1: High Demand for US PREMIUM
  console.log("\n📈 [Stage 1] High Market Demand for US|PREMIUM (Multiplier: 3.0)...");
  for(let i=0; i<150; i++) {
    const bidders = MarketSimulator.getBidders(3.0);
    const res = AdBrain.runAuction(US_PREMIUM, bidders);
    ShadowAuctionRunner.trigger(US_PREMIUM, bidders, res);
    AdBrain.releaseResult(res);
  }

  // 📉 STAGE 2: Low Demand for EU LOW
  console.log("\n📉 [Stage 2] Low Market Demand for EU|LOW (Multiplier: 0.4)...");
  for(let i=0; i<150; i++) {
    const bidders = MarketSimulator.getBidders(0.4);
    const res = AdBrain.runAuction(EU_LOW, bidders);
    ShadowAuctionRunner.trigger(EU_LOW, bidders, res);
    AdBrain.releaseResult(res);
  }

  // Wait for Autopilot Ticks
  console.log("⏱️ Waiting for Autopilot to process segments (12s)...");
  await new Promise(r => setTimeout(r, 12000));
  
  const snap = yieldSegmentStore.snapshot();
  console.log("\n📊 SEGMENTED MULTIPLIERS SNAPSHOT:");
  console.log(JSON.stringify(snap, null, 2));

  // Verify Divergence
  const usMult = yieldSegmentStore.getGeoMult('US');
  const euMult = yieldSegmentStore.getGeoMult('EU');
  const premiumMult = yieldSegmentStore.getSegmentMult('PREMIUM');
  const lowMult = yieldSegmentStore.getSegmentMult('LOW');

  console.log(`\n⚖️ US Geo Multiplier: ${usMult.toFixed(3)}`);
  console.log(`⚖️ EU Geo Multiplier: ${euMult.toFixed(3)}`);
  console.log(`⚖️ PREMIUM Segment Multiplier: ${premiumMult.toFixed(3)}`);
  console.log(`⚖️ LOW Segment Multiplier: ${lowMult.toFixed(3)}`);

  if (usMult > 1.0 && lowMult < 1.0) {
    console.log("\n✅ VERDICT: DIVERGENCE VERIFIED (Segmentation is working)");
  } else {
    console.log("\n⚠️ VERDICT: DIVERGENCE NOT OBSERVED (Check deltas)");
  }

  EconomicAutopilot.stop();
  process.exit(0);
}

runSegmentedMarketTest().catch(console.error);

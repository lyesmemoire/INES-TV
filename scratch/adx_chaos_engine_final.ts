// chaos_engine_v2_staff.ts
import { AdBrain, setDeterministicMode, releaseResult } from '../server/services/adBrain.service.js';
import { ShadowAuctionRunner, comparisonEngine } from '../server/services/shadowMode.service.js';
import { performance } from 'node:perf_hooks';

const TOTAL_REQUESTS = 1000;
const CONCURRENCY = 100;

// --- Internal Bidders ---
const BIDDERS = [
  { id: "internal_prime", baseEcpm: 1.25, reliability: 0.98, avgLatency: 8 },
  { id: "partner_beta", baseEcpm: 0.95, reliability: 0.85, avgLatency: 22 },
  { id: "house_fallback", baseEcpm: 0.5, reliability: 1.0, avgLatency: 4 }
];

async function runAdvancedAudit() {
  console.log("🔥 [ChaosEngine] Starting AdX v2.0 Staff Audit...");

  // 1. 🛡️ [TEST] STRICT INTERNAL LOCK VALIDATION
  console.log("🛡️ [ChaosEngine] Running Internal Engine Lock Validation...");
  
  const ctx = {
    userId: 'test_user',
    tenantId: 'tenant_1',
    geo: 'US' as any,
    segment: 'PREMIUM' as any,
    qoeScore: 0.9,
    trustScore: 0.95
  };

  try {
    AdBrain.runInternalLockValidation(ctx, BIDDERS);
    console.log("   Internal Lock: ✅ SECURE");
  } catch (e: any) {
    console.log(`   Internal Lock: ❌ FAILED - ${e.message}`);
    process.exit(1);
  }

  // 2. 📈 [TEST] EVENT LOOP LAG & GC PRESSURE
  console.log("\n📈 [ChaosEngine] Measuring Event Loop Lag & Throughput...");
  
  const lagHistogram: number[] = [];
  let lastTime = performance.now();
  
  const lagInterval = setInterval(() => {
    const now = performance.now();
    const lag = now - lastTime - 10; // 10ms threshold
    lagHistogram.push(Math.max(0, lag));
    lastTime = now;
  }, 10);

  const results: any[] = [];
  const start = Date.now();

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const batch = Array.from({ length: CONCURRENCY }).map(async () => {
      const auctionCtx = {
        userId: `user_${Math.random()}`,
        tenantId: 'tenant_1',
        geo: (Math.random() > 0.5 ? 'US' : 'EU') as any,
        segment: (Math.random() > 0.7 ? 'PREMIUM' : 'STANDARD') as any,
        qoeScore: 0.5 + Math.random() * 0.5,
        trustScore: 0.8 + Math.random() * 0.2
      };

      // 🔥 AD BRAIN PROD RUN
      const startRun = performance.now();
      const res = AdBrain.runAuction(auctionCtx, BIDDERS);
      const endRun = performance.now();

      // 🟠 SHADOW TRIGGER (Simulated hook)
      ShadowAuctionRunner.trigger(auctionCtx, BIDDERS, res);
      
      results.push({ 
        success: !res.isFallback, 
        latency: endRun - startRun, 
        price: res.price 
      });
      
      AdBrain.releaseResult(res);
    });
    await Promise.all(batch);
  }

  // 🟠 WAIT FOR SHADOW BACKGROUND TASKS
  await ShadowAuctionRunner.waitIdle();

  clearInterval(lagInterval);
  const totalDuration = Date.now() - start;

  printAuditReport(results, lagHistogram, totalDuration);
}

function printAuditReport(results: any[], lagHistogram: number[], totalTime: number) {
  const reqs = results.map(r => r.latency).sort((a, b) => a - b);
  const p50 = reqs[Math.floor(reqs.length * 0.5)] || 0;
  const p95 = reqs[Math.floor(reqs.length * 0.95)] || 0;
  const p99 = reqs[Math.floor(reqs.length * 0.99)] || 0;
  
  const lags = lagHistogram.sort((a, b) => a - b);
  const p99Lag = lags[Math.floor(lags.length * 0.99)] || 0;

  console.log(`\n📊 AdX v2.0 STAFF AUDIT REPORT`);
  console.log(`-----------------------------------`);
  console.log(`📈 PERFORMANCE (Logic Focus)`);
  console.log(`   p50: ${p50.toFixed(3)}ms`);
  console.log(`   p99: ${p99.toFixed(3)}ms ${p99 <= 0.5 ? '✅ (Ultra-Low)' : '⚠️'}`);
  
  console.log(`\n🎢 EVENT LOOP HEALTH`);
  console.log(`   p99 Lag Spike: ${p99Lag.toFixed(2)}ms ${p99Lag < 5 ? '✅ (Stable)' : '❌ (High Pressure)'}`);
  
  console.log(`\n💰 THROUGHPUT`);
  console.log(`   Requests: ${TOTAL_REQUESTS}`);
  console.log(`   Wall Time: ${totalTime}ms`);
  console.log(`   Avg RPS: ${((TOTAL_REQUESTS / totalTime) * 1000).toFixed(0)} req/s`);

  const shadowReport = comparisonEngine.report();
  console.log(`\n🟠 SHADOW MODE CONSISTENCY`);
  console.log(`-----------------------------------`);
  console.log(`   Mismatches: ${shadowReport.winnerMismatchRate}%`);
  console.log(`   Score Drift: ${shadowReport.avgScoreDiff}`);
  console.log(`   Yield Delta: ${shadowReport.relativeYieldDelta}`);
  console.log(`   Volatility: ${shadowReport.yieldVolatility}`);
  console.log(`   Confidence: ${shadowReport.confidenceScore}`);
  console.log(`   Shadow Latency: ${shadowReport.avgShadowLatency}`);

  if (p99Lag < 5 && p99 < 1) {
    console.log(`\n✅ VERDICT: PRODUCTION READY (Staff Engineering Grade)`);
  } else {
    console.log(`\n⚠️ VERDICT: SYSTEM UNDER PRESSURE`);
  }
}

runAdvancedAudit().catch(console.error);

import { comparisonEngine } from "./shadowMode.service.js";
import { yieldSegmentStore, DimensionType } from "./yieldSegmentStore.js";
import { yieldMemoryStore } from "./yieldMemoryStore.js";
import { YieldControlEngine } from "./yieldControlEngine.js";

/* ============================================================
   ECONOMIC AUTOPILOT (Self-Learning Feedback Engine)
============================================================ */

export class EconomicAutopilot {
  private static interval: NodeJS.Timeout | null = null;
  private static readonly TICK_MS = 5000;
  
  // 🛡️ ADAPTATION PARAMETERS
  private static readonly ADAPTATION_STEP = 0.02; 
  private static readonly COOLDOWN_MS = 5000;
  
  private static lastUpdateMap = new Map<string, number>();
  private static warmupTicks = 0;
  private static readonly WARMUP_LIMIT = 3;
  private static lastRollback = 0;
 
  // 🎯 Phase 1.3: Production Hardening Tuning
  private static readonly THRESHOLD_LATENCY = process.env.NODE_ENV === "production" ? 3000 : 1500;
  private static readonly THRESHOLD_ERROR_RATE = process.env.NODE_ENV === "production" ? 0.1 : 0.05;

  static start() {
    if (this.interval) return;
    console.log("🚀 [EconomicPilot] Autopilot engaged. Mode: SELF-LEARNING");
    this.interval = setInterval(() => this.tick(), this.TICK_MS);
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("🛑 [EconomicPilot] Autopilot disengaged.");
    }
  }

  private static tick() {
    // 1. WARMUP CHECK
    if (this.warmupTicks < this.WARMUP_LIMIT) {
      this.warmupTicks++;
      return; 
    }

    // 2. GLOBAL SAFETY & METRIC VALIDATION
    const globalReport = comparisonEngine.report();
    const globalConfidence = parseFloat(globalReport.confidenceScore) / 100;
    const globalVolatility = parseFloat(globalReport.yieldVolatility);

    // 🛑 Guard invalid metrics (NaN, Infinity, or Zero activity)
    if (isNaN(globalConfidence) || isNaN(globalVolatility)) {
      return;
    }

    // 🛡️ MINIMUM DATA GATE: Do NOT evaluate stability without sufficient comparisons
    // When totalComparisons < 10, confidence is 0 by design (warmup).
    // Treating this as "instability" causes permanent rollback spam across all workers.
    if (globalReport.total < 10) {
      return; // Not enough data to judge — assume stable
    }

    // ❄️ COOLDOWN ANTI-LOOP (Cooldown protected)
    const now = Date.now();
    const currentLatency = parseFloat(globalReport.avgShadowLatency);
    
    // Phase 1.3 Tuning: Use relaxed thresholds in prod
    const isUnstable = globalConfidence < 0.80 || 
                      globalVolatility > this.THRESHOLD_ERROR_RATE || 
                      currentLatency > this.THRESHOLD_LATENCY;
 
    if (isUnstable) {
      if (now - this.lastRollback < 5000) {
        return; 
      }

      console.warn(`⚠️ [EconomicPilot] GLOBAL INSTABILITY. Latency: ${currentLatency}ms, Volatility: ${globalVolatility}. Triggering Rollback.`);
      YieldControlEngine.rollback();
      this.lastRollback = now;
      this.lastUpdateMap.clear();
      return;
    }

    // 3. SEGMENTED OPTIMIZATION & LEARNING
    const segmentedReport = comparisonEngine.getSegmentedReport();

    for (const [dimKey, stats] of Object.entries(segmentedReport)) {
      const [type, value] = dimKey.split(":");
      
      // Update Learning Memory
      // Only for individual dimensions (to avoid bias explosion) or composite if supported
      const currentMult = yieldSegmentStore.get(type as DimensionType, value);
      yieldMemoryStore.update(dimKey, stats.delta, currentMult);

      // 🧠 LEARNED BIAS (Convergence)
      // If we have a learned best multiplier, gently pull the current value toward it
      const learnedBest = yieldMemoryStore.getBestMultiplier(dimKey);
      if (learnedBest && type !== "geo|segment") { // Bias applied only to base dimensions
        const biasDelta = (learnedBest - currentMult) * 0.1;
        if (Math.abs(biasDelta) > 0.002) {
          yieldSegmentStore.adjust(type as DimensionType, value, biasDelta);
        }
      }

      // Reactive Logic (Cooldown protected)
      const lastUpdate = this.lastUpdateMap.get(dimKey) || 0;
      if (now - lastUpdate < this.COOLDOWN_MS) continue;

      if (stats.delta > 0.005 && stats.volatility < 0.01) {
        yieldSegmentStore.adjust(type as DimensionType, value, this.ADAPTATION_STEP);
        this.lastUpdateMap.set(dimKey, now);
        console.log(`📈 [EconomicPilot] Reactive Up ${dimKey}: +2%`);
      }
      else if (stats.delta < -0.05) {
        yieldSegmentStore.adjust(type as DimensionType, value, -this.ADAPTATION_STEP);
        this.lastUpdateMap.set(dimKey, now);
        console.log(`📉 [EconomicPilot] Reactive Down ${dimKey}: -2%`);
      }
    }

    // 3. MEMORY DECAY
    yieldMemoryStore.decay();
  }
}

import { BidContext, AuctionResult, Bidder, AdBrain } from "./adBrain.service.js";
import { performance } from "node:perf_hooks";
import { YieldControlEngine } from "./yieldControlEngine.js";

/* ============================================================
   SHADOW MODE CONFIGURATION
============================================================ */

export const SHADOW_CONFIG = Object.freeze({
  enabled: true,
  sampleRate: 1.0, // 100% of traffic for initial validation
  maxBufferSize: 10000,
  explorationDelta: 0.05, // Shadow tests +5% floor to see if market bears it
});

/* ============================================================
   1. HIGH PERFORMANCE RING BUFFER (O(1) - Zero GC Pressure)
============================================================ */

class RollingMetricBuffer {
  private buffer: Float64Array;
  private index = 0;
  private count = 0;
  private sum = 0;
  private sumSq = 0;

  constructor(private size: number = SHADOW_CONFIG.maxBufferSize) {
    this.buffer = new Float64Array(size); // Pre-allocated typed array
  }

  push(value: number) {
    // 🛡️ EFFECTIVE RING BUFFER (Discard old values from sums)
    const oldVal = this.buffer[this.index];
    if (this.count === this.size) {
      this.sum -= oldVal;
      this.sumSq -= (oldVal * oldVal);
    } else {
      this.count++;
    }

    this.buffer[this.index] = value;
    this.sum += value;
    this.sumSq += (value * value);
    
    this.index = (this.index + 1) % this.size;
  }

  getAverage(): number {
    if (this.count === 0) return 0;
    return this.sum / this.count;
  }

  getVariance(): number {
    if (this.count < 2) return 0;
    const avg = this.getAverage();
    const variance = (this.sumSq / this.count) - (avg * avg);
    return Math.max(0, variance); // Protect against precision noise
  }
}

/* ============================================================
   2. SHADOW THROTTLING QUEUE (Event Loop Safety)
============================================================ */

class ShadowQueue {
  private queue: (() => void)[] = [];
  private running = false;
  private resolveEmpty: (() => void) | null = null;

  get size() { return this.queue.length; }
  get isIdle() { return !this.running && this.queue.length === 0; }

  push(task: () => void) {
    this.queue.push(task);
    this.drain();
  }

  async waitUntilEmpty(): Promise<void> {
    if (this.isIdle) return;
    return new Promise(resolve => {
      this.resolveEmpty = resolve;
    });
  }

  private drain() {
    // If already running or nothing to do, stop
    if (this.running) return;
    
    if (this.queue.length === 0) {
      if (this.resolveEmpty) {
        this.resolveEmpty();
        this.resolveEmpty = null;
      }
      return;
    }

    this.running = true;

    // Use process.nextTick to process serially without blocking the main event loop
    process.nextTick(() => {
      const task = this.queue.shift();
      if (task) {
        try {
          task();
        } catch (e) {
          console.error("✕ [ShadowQueue] Task execution failed:", e);
        }
      }
      this.running = false;
      this.drain();
    });
  }
}

const shadowQueue = new ShadowQueue();

/* ============================================================
   3. COMPARISON ENGINE (Economic & Logic Invariants)
============================================================ */

class ShadowComparisonEngine {
  private winnerMismatches = 0;
  private totalComparisons = 0;
  
  private scoreDiffs = new RollingMetricBuffer();
  private yieldDeltas = new RollingMetricBuffer(); // Normalized Economics
  private latencies = new RollingMetricBuffer();

  // 🌍 DIMENSION-SPECIFIC TRACKING (Normalized Keys)
  private dimensionMetrics = new Map<string, {
    yieldDeltas: RollingMetricBuffer,
    count: number
  }>();

  // EWMA Tracking (Trend Analysis)
  private prodYieldEMA = 0;
  private shadowYieldEMA = 0;
  private readonly ALPHA = 0.05; // 5% weight on new data for trend stability

  private getDimensionMetrics(key: string) {
    if (!this.dimensionMetrics.has(key)) {
      this.dimensionMetrics.set(key, {
        yieldDeltas: new RollingMetricBuffer(2000), // 2k samples per segment
        count: 0
      });
    }
    return this.dimensionMetrics.get(key)!;
  }

  compare(prod: AuctionResult, shadow: AuctionResult, ctx: BidContext) {
    this.totalComparisons++;

    // Logic Check
    if (prod.bidderId !== shadow.bidderId) {
      this.winnerMismatches++;
    }

    // Mathematical Check (p99 of score drift)
    this.scoreDiffs.push(Math.abs(prod.rawScore - shadow.rawScore));

    // Economic Delta Tracking (Normalized yield uplift/loss)
    const priceDiff = shadow.price - prod.price;
    const relativeDelta = prod.price > 0 ? priceDiff / prod.price : 0;
    
    // 📊 Global Tracking
    this.yieldDeltas.push(relativeDelta);

    // 📊 Segmented Tracking (Normalized keys)
    const qoeScore = ctx.qoeScore ?? 1.0;
    const qoeBucket = Math.floor(qoeScore * 10);
    const dimensions = [
      `geo:${ctx.geo || "MA"}`,
      `segment:${ctx.segment || "STANDARD"}`,
      `geo:${ctx.geo || "MA"}|segment:${ctx.segment || "STANDARD"}`,
      `device:${ctx.device || "DESKTOP"}`,
      `qoe:${qoeBucket}`
    ];

    for (const dim of dimensions) {
      const stats = this.getDimensionMetrics(dim);
      stats.count++;
      stats.yieldDeltas.push(relativeDelta);
    }
    // Price Trend Tracking (EWMA)
    this.prodYieldEMA = this.prodYieldEMA === 0 ? prod.price : this.ALPHA * prod.price + (1 - this.ALPHA) * this.prodYieldEMA;
    this.shadowYieldEMA = this.shadowYieldEMA === 0 ? shadow.price : this.ALPHA * shadow.price + (1 - this.ALPHA) * this.shadowYieldEMA;
  }

  calculateConfidence(): number {
    if (this.totalComparisons < 10) return 0; // Warmup phase

    const volatility = this.yieldDeltas.getVariance();
    const driftPenalty = Math.abs(this.shadowYieldEMA - this.prodYieldEMA);

    // 🧠 Confidence Score VERSION PRO
    // 1 / (1 + volatility + drift)
    return 1 / (1 + (volatility * 10) + driftPenalty);
  }

  getSegmentedReport() {
    const report: Record<string, { delta: number, volatility: number, total: number }> = {};
    for (const [dim, stats] of this.dimensionMetrics.entries()) {
      if (stats.count < 20) continue; // Minimum volume threshold
      report[dim] = {
        delta: stats.yieldDeltas.getAverage(),
        volatility: stats.yieldDeltas.getVariance(),
        total: stats.count
      };
    }
    return report;
  }

  recordLatency(ms: number) {
    this.latencies.push(ms);
  }

  report() {
    const confidence = this.calculateConfidence();
    return {
      total: this.totalComparisons,
      winnerMismatchRate: this.totalComparisons > 0 ? (this.winnerMismatches / this.totalComparisons).toFixed(4) : "0.0000",
      avgScoreDiff: this.scoreDiffs.getAverage().toFixed(6),
      relativeYieldDelta: (this.yieldDeltas.getAverage() * 100).toFixed(4) + "%",
      yieldVolatility: this.yieldDeltas.getVariance().toFixed(6),
      confidenceScore: (confidence * 100).toFixed(2) + "%",
      avgShadowLatency: this.latencies.getAverage().toFixed(4) + "ms",
    };
  }
}

export const comparisonEngine = new ShadowComparisonEngine();

/* ============================================================
   4. SHADOW RUNNER (Entry Point)
============================================================ */

export class ShadowAuctionRunner {
  /**
   * Identifies if a shadow run should occur and queues it safely.
   */
  static trigger(context: BidContext, bidders: Bidder[], prodResult: AuctionResult) {
    if (!SHADOW_CONFIG.enabled) return;
    
    // Sampling gate
    if (SHADOW_CONFIG.sampleRate < 1.0 && Math.random() > SHADOW_CONFIG.sampleRate) return;

    // 🛡️ CRITICAL: CAPTURE SNAPSHOT
    // Because prodResult will be recycled into the pool immediately after trigger()
    const prodSnapshot = {
      bidderId: prodResult.bidderId,
      price: prodResult.price,
      rawScore: prodResult.rawScore
    };

    // FIRE AND FORGET - Protected by ShadowQueue
    shadowQueue.push(() => {
      const start = performance.now();
      
      // 🧪 EXPLORATION: Shadow test
      const shadowResult = AdBrain.runAuction(context);
      
      const duration = performance.now() - start;

      // Comparative analysis with segmentation context
      comparisonEngine.compare(prodSnapshot as AuctionResult, shadowResult, context);
      comparisonEngine.recordLatency(duration);

      // MANDATORY: Return object to the pool to prevent leaks
      AdBrain.releaseResult(shadowResult);
    });
  }

  static async waitIdle() {
    await shadowQueue.waitUntilEmpty();
  }
}

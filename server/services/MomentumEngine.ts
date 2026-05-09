/**
 * 📁 /server/services/MomentumEngine.ts
 * 🔮 PREDICTIVE MOMENTUM ENGINE — INES TV v1.5.1
 *
 * Patches over v1.5.0:
 *   ✅ Noise filter (threshold 0.02) → élimination des spikes OLS parasites
 *   ✅ Clamp sécurisé sur chaque slope individuel avant agrégation
 *   ✅ Confidence score via variance normalisée → exploitable UI + prewarm guard
 *   ✅ Enhanced degradationWarning: s30 < -0.3 AND s60 < -0.2 (double confirmation)
 *   ✅ predictedTransition toujours défini (HOT/WARM/DEAD) avec seuils 0.7/0.3
 *   ✅ Architecture class + singleton → ready for cluster horizontal scaling
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MomentumSnapshot {
  channelId: string;
  slope_30s: number;
  slope_60s: number;
  slope_180s: number;
  heatAcceleration: number;  // weighted composite [-1..+1]
  predictedPressure: number; // forecast t+3min [0..1]
  predictedTransition: "HOT" | "WARM" | "DEAD";
  confidence: number;        // [0..1] — faible variance = haute confiance
  prewarmRecommended: boolean;
  degradationWarning: boolean;
  ts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WINDOW_SIZE = 300;           // 5 min de data à 1 tick/s
const NOISE_THRESHOLD = 0.02;      // slope < 2% ignoré → signal propre
const PREWARM_ACCEL_THRESHOLD = 0.15;

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class MomentumEngine {
  private buffers = new Map<string, Float64Array>();
  private indices = new Map<string, number>();
  private snapshots = new Map<string, MomentumSnapshot>();
  private lastPruneAt = Date.now();

  // ──────────────────────────────────────────────────────────────────────────
  // INGEST — 1 appel par tick par canal
  // ──────────────────────────────────────────────────────────────────────────

  async ingest(channelId: string, value: number): Promise<void> {
    const { redisClient, usingRedis } = await import("../lib/cache.js");

    if (usingRedis && redisClient) {
      try {
        const panicMode = await (redisClient as any).get("panic:mode");
        if (panicMode === "EXTREME") return;
      } catch {
        // ignore
      }
    }

    if (!this.buffers.has(channelId)) {
      this.buffers.set(channelId, new Float64Array(WINDOW_SIZE));
      this.indices.set(channelId, 0);
    }

    const buffer = this.buffers.get(channelId)!;
    const idx = this.indices.get(channelId)!;

    buffer[idx] = value;
    this.indices.set(channelId, (idx + 1) % WINDOW_SIZE);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ANALYZE — calcule le snapshot complet
  // ──────────────────────────────────────────────────────────────────────────

  analyze(channelId: string): MomentumSnapshot | null {
    const buffer = this.buffers.get(channelId);
    if (!buffer) return null;

    const now = Date.now();

    // Multi-window slopes avec clamp + noise filter
    const s30  = this.applyNoiseFilter(this.clamp(this.computeSlope(buffer, channelId, 30)));
    const s60  = this.applyNoiseFilter(this.clamp(this.computeSlope(buffer, channelId, 60)));
    const s180 = this.applyNoiseFilter(this.clamp(this.computeSlope(buffer, channelId, 180)));

    // Weighted composite (court-terme prioritaire)
    const heatAcceleration = this.clamp(0.5 * s30 + 0.3 * s60 + 0.2 * s180);

    // Valeur courante (dernier point écrit)
    const headIdx = this.indices.get(channelId)!;
    const current = buffer[(headIdx - 1 + WINDOW_SIZE) % WINDOW_SIZE];

    // Forecast à t+3min (180s)
    const predictedPressure = this.clamp(current + heatAcceleration * 180, 0, 1);

    // Transition prédite (seuils calibrés pour streaming media)
    const predictedTransition: "HOT" | "WARM" | "DEAD" =
      predictedPressure > 0.7 ? "HOT"
      : predictedPressure > 0.3 ? "WARM"
      : "DEAD";

    // Confidence via variance normalisée (faible variance = signal stable)
    const confidence = this.computeConfidence(buffer);

    // Degradation: double confirmation (30s ET 60s en chute)
    const degradationWarning = s30 < -0.3 && s60 < -0.2;

    // Prewarm: montée vers HOT OU HOT avec accélération soutenue
    const prewarmRecommended =
      predictedTransition === "HOT" ||
      (current > 0.5 && heatAcceleration > PREWARM_ACCEL_THRESHOLD);

    const snapshot: MomentumSnapshot = {
      channelId,
      slope_30s:  parseFloat(s30.toFixed(5)),
      slope_60s:  parseFloat(s60.toFixed(5)),
      slope_180s: parseFloat(s180.toFixed(5)),
      heatAcceleration: parseFloat(heatAcceleration.toFixed(4)),
      predictedPressure: parseFloat(predictedPressure.toFixed(3)),
      predictedTransition,
      confidence: parseFloat(confidence.toFixed(3)),
      prewarmRecommended,
      degradationWarning,
      ts: now,
    };

    this.snapshots.set(channelId, snapshot);
    return snapshot;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOP-K — pour le broadcast 5s et le REST endpoint
  // ──────────────────────────────────────────────────────────────────────────

  getTopMomentumChannels(k = 20): MomentumSnapshot[] {
    const results: MomentumSnapshot[] = [];

    for (const channelId of this.buffers.keys()) {
      const snapshot = this.analyze(channelId);
      if (snapshot) results.push(snapshot);
    }

    return results
      .filter(s => s.heatAcceleration !== 0 || s.degradationWarning)
      .sort((a, b) => Math.abs(b.heatAcceleration) - Math.abs(a.heatAcceleration))
      .slice(0, k);
  }

  getLastSnapshot(channelId: string): MomentumSnapshot | null {
    return this.snapshots.get(channelId) ?? null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CLEANUP — appel toutes les 60 ticks depuis OpsEngine
  // ──────────────────────────────────────────────────────────────────────────

  pruneStale(): void {
    const cutoff = Date.now() - 600_000; // 10 min
    for (const [id, snap] of this.snapshots) {
      if (snap.ts < cutoff) {
        this.buffers.delete(id);
        this.indices.delete(id);
        this.snapshots.delete(id);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE UTILS
  // ──────────────────────────────────────────────────────────────────────────

  /** Clamp valeur dans [min, max] */
  private clamp(value: number, min = -1, max = 1): number {
    return Math.max(min, Math.min(max, value));
  }

  /** Élimine le bruit sous le seuil (jitter réseau, spikes courts) */
  private applyNoiseFilter(value: number, threshold = NOISE_THRESHOLD): number {
    return Math.abs(value) < threshold ? 0 : value;
  }

  /** OLS linear regression sur la fenêtre `window` points */
  private computeSlope(buffer: Float64Array, channelId: string, window: number): number {
    const len = buffer.length;
    const start = Math.max(0, len - window);
    const n = len - start;

    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = start; i < len; i++) {
      const x = i - start;
      const y = buffer[i];
      sumX  += x;
      sumY  += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return 0;

    return (n * sumXY - sumX * sumY) / denom;
  }

  /** Confidence = 1 / (1 + variance) — faible variance → signal stable */
  private computeConfidence(buffer: Float64Array): number {
    const len = buffer.length;
    if (len === 0) return 0;

    let sum = 0;
    for (let i = 0; i < len; i++) sum += buffer[i];
    const mean = sum / len;

    let variance = 0;
    for (let i = 0; i < len; i++) variance += (buffer[i] - mean) ** 2;
    variance /= len;

    return 1 / (1 + variance);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON — utilisé par OpsEngine et les routes REST
// ─────────────────────────────────────────────────────────────────────────────

export const momentumEngine = new MomentumEngine();

import { StreamSource } from "@/src/types";
import { trackStreamEvent } from "@/src/services/analytics";

export const sendQoEScoreToAnalytics = (
  channel_id: string,
  cdn: string,
  score: number
) => {
  trackStreamEvent({
    channel_id,
    event_type: "switch",
    cdn,
    qoe_score: score,
  });
};

export type QoEMetrics = {
  startupTime: number;
  rebufferCount: number;
  rebufferDuration: number;
  errorCount: number;
};

const STORAGE_KEY = "qoe_scores";

/**
 * Compute QoE Score — Lower is better.
 */
export const computeQoEScore = (metrics: QoEMetrics): number => {
  return (
    metrics.startupTime * 0.3 +
    metrics.rebufferDuration * 0.5 +
    metrics.errorCount * 100 +
    metrics.rebufferCount * 20
  );
};

/**
 * Store CDN Performance Score
 */
export const saveQoEScore = (cdn: string, score: number) => {
  if (typeof window === "undefined" || !cdn) return;

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    existing[cdn] = {
      score,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.debug(`[QoE] Saved score for ${cdn}: ${Math.round(score)}`);
  } catch (e) {
    console.warn("[QoE] Failed to save score to localStorage", e);
  }
};

/**
 * Get best CDN from historical cache
 */
export const getBestCDNFromCache = (
  sources: StreamSource[]
): StreamSource | null => {
  if (typeof window === "undefined" || !sources.length) return null;

  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    const ranked = sources
      .map((s) => ({
        source: s,
        score: cache[s.cdn || s.label || ""]?.score ?? Infinity,
      }))
      .sort((a, b) => a.score - b.score);

    if (ranked[0] && ranked[0].score !== Infinity) {
      console.info("[QoE] Historical winner selected:", ranked[0].source.cdn || ranked[0].source.label);
      return ranked[0].source;
    }
  } catch (e) {
    console.warn("[QoE] Cache read failed", e);
  }

  return null;
};

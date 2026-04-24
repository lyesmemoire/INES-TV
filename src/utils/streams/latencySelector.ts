import { StreamSource } from "@/types";

type ScoredSource = StreamSource & {
  latency: number;
};

const TEST_TIMEOUT = 3000;

const measureLatency = async (url: string): Promise<number> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT);

  const start = performance.now();

  try {
    // ⚡ HEAD request is lightweight for latency testing
    await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });

    return performance.now() - start;
  } catch (e) {
    return Infinity;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * 📊 LATENCY SELECTOR
 * Tests all available sources and returns the one with the lowest response time.
 */
export const selectBestSource = async (
  sources: StreamSource[]
): Promise<StreamSource | null> => {
  if (!sources || !sources.length) return null;

  console.log(`[Latency] Testing ${sources.length} sources...`);

  const results: ScoredSource[] = await Promise.all(
    sources.map(async (source) => {
      const latency = await measureLatency(source.url);

      return {
        ...source,
        latency,
      };
    })
  );

  const valid = results.filter((s) => isFinite(s.latency));

  if (!valid.length) {
    console.warn("[Latency] No responsive sources found, falling back to priority-only selection.");
    return sources[0];
  }

  valid.sort((a, b) => a.latency - b.latency);

  console.info(
    "[Latency Ranking]",
    valid.map((s) => ({
      cdn: s.cdn || s.label,
      latency: `${Math.round(s.latency)}ms`,
    }))
  );

  return valid[0];
};

/* ============================================================
   YIELD MEMORY STORE (The Learning Layer)
   Maintains long-term "Last Best Known" states for economic segments.
============================================================ */

type MemoryEntry = {
  ewmaYield: number
  variance: number
  bestMultiplier: number
  lastUpdate: number
}

const ALPHA = 0.2
const IMPROVEMENT_THRESHOLD = 0.01 // 1% gain required to update "Best"
const VARIANCE_LIMIT = 0.05        // Ignore learning during chaos
const DECAY_RATE = 0.995           // 0.5% decay per idle period

class YieldMemoryStore {
  private store = new Map<string, MemoryEntry>()

  /**
   * 🧠 LEARN & UPDATE
   * Incorporates new yield data and updates the "Best Known" state if justified.
   */
  update(key: string, yieldValue: number, multiplier: number) {
    const now = Date.now()
    const prev = this.store.get(key)

    if (!prev) {
      this.store.set(key, {
        ewmaYield: yieldValue,
        variance: 0,
        bestMultiplier: multiplier,
        lastUpdate: now
      })
      return
    }

    // Smoothed Yield (Trend Analysis)
    const newEwma = ALPHA * yieldValue + (1 - ALPHA) * prev.ewmaYield

    // Local Variance (Stability Analysis)
    const variance = ALPHA * Math.pow(yieldValue - newEwma, 2) + (1 - ALPHA) * prev.variance

    // 🚫 PROTECTION: Skip learning if market is too unstable (variance spike)
    if (variance > VARIANCE_LIMIT) {
      return
    }

    let bestMultiplier = prev.bestMultiplier

    // 📈 UPDATE BEST: Only if current yield significantly exceeds the established trend
    if (yieldValue > prev.ewmaYield * (1 + IMPROVEMENT_THRESHOLD)) {
      bestMultiplier = multiplier
    }

    this.store.set(key, {
      ewmaYield: newEwma,
      variance,
      bestMultiplier,
      lastUpdate: now
    })
  }

  /**
   * Returns the learned optimal multiplier for a specific segment.
   */
  getBestMultiplier(key: string): number | null {
    return this.store.get(key)?.bestMultiplier ?? null;
  }

  /**
   * 📉 MEMORY DECAY
   * Gently degrades learned values over time if not refreshed.
   * This ensures the system re-explores the price space daily/hourly.
   */
  decay() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      // 15-second "freshness" window
      if (now - entry.lastUpdate > 15000) {
        entry.bestMultiplier *= DECAY_RATE;
        // Optimization: Stop decaying if we're back to baseline
        if (entry.bestMultiplier < 1.0) {
           entry.bestMultiplier = 1.0;
        }
      }
    }
  }

  snapshot() {
    return Object.fromEntries(this.store);
  }
}

export const yieldMemoryStore = new YieldMemoryStore()

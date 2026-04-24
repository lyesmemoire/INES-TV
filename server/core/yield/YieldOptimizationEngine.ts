export type YieldSignal = {
  geo: string;
  segment: string;
  floorPressure: number;
  avgSubFloorRatio: number;
  demandSignal: "UNDERPRICED" | "OVERPRICED" | "BALANCED";
};

type YieldState = {
  floorMultiplier: number;
  lastUpdate: number;
};

export class YieldOptimizationEngine {
  private state: Map<string, YieldState> = new Map();

  private getKey(geo: string, segment: string) {
    return `${geo}:${segment}`;
  }

  private getState(key: string): YieldState {
    if (!this.state.has(key)) {
      this.state.set(key, {
        floorMultiplier: 1.0,
        lastUpdate: Date.now(),
      });
    }
    return this.state.get(key)!;
  }

  update(signal: YieldSignal) {
    const key = this.getKey(signal.geo, signal.segment);
    const state = this.getState(key);

    let delta = 0;

    // 🔥 CORE ECONOMIC LOGIC
    if (signal.demandSignal === "UNDERPRICED") {
      delta = +0.05 * signal.floorPressure;
    }

    if (signal.demandSignal === "OVERPRICED") {
      delta = -0.03 * (1 - signal.avgSubFloorRatio);
    }

    // 🧠 damped update (stability layer)
    state.floorMultiplier = this.clamp(
      state.floorMultiplier + delta,
      0.6,
      1.8
    );

    state.lastUpdate = Date.now();
  }

  getFloorMultiplier(geo: string, segment: string) {
    const key = this.getKey(geo, segment);
    return this.getState(key).floorMultiplier;
  }

  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }
}

type OptimizationInput = {
  key: string; // geo|segment
  currentFloor: number;
  suggestedMultiplier: number;
  forecastDelta: number;
  fillRate: number;
};

type OptimizerState = {
  lastMultiplier: number;
};

export class AutonomousOptimizer {
  private state = new Map<string, OptimizerState>();

  optimize(input: OptimizationInput): number {
    const prev = this.state.get(input.key)?.lastMultiplier ?? 1.0;

    let multiplier = input.suggestedMultiplier;

    // 🛡️ SAFETY 1 — protect fill rate
    if (input.fillRate < 0.6) {
      multiplier *= 0.9;
    }

    // 🛡️ SAFETY 2 — avoid negative revenue moves
    if (input.forecastDelta < 0) {
      multiplier *= 0.95;
    }

    // 🛡️ SAFETY 3 — volatility dampening
    multiplier = this.damp(multiplier, prev);

    // 🛡️ SAFETY 4 — hard clamp
    multiplier = this.clamp(multiplier, 0.7, 1.5);

    this.state.set(input.key, { lastMultiplier: multiplier });

    return multiplier;
  }

  private damp(next: number, prev: number): number {
    // anti-oscillation smoothing
    return prev + (next - prev) * 0.2;
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }
}

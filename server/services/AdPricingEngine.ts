// server/services/AdPricingEngine.ts

type Liveness = "HOT" | "WARM" | "DEAD";

export class AdPricingEngine {
  computeCPM(
    baseCPM: number,
    heatAcceleration: number,
    liveness: Liveness,
    regionalDemand = 1
  ) {
    const livenessMultiplier =
      liveness === "HOT" ? 2 :
      liveness === "WARM" ? 1 :
      0.5;

    const dynamic =
      baseCPM *
      (1 + heatAcceleration) *
      livenessMultiplier *
      regionalDemand;

    return Math.max(0.1, Number(dynamic.toFixed(2)));
  }
}

export const adPricingEngine = new AdPricingEngine();

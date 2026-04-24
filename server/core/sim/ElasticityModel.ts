export class ElasticityModel {
  // simple but powerful approximation
  estimateRevenueChange(base: number, floorDelta: number) {
    // demand curve: price ↑ => volume ↓
    const volumeFactor = Math.exp(-0.8 * floorDelta);
    const priceFactor = 1 + floorDelta;

    return base * volumeFactor * priceFactor;
  }
}

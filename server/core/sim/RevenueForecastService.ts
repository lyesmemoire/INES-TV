import { RevenueSimulator } from "./RevenueSimulator.js";
import { ElasticityModel } from "./ElasticityModel.js";

export class RevenueForecastService {
  private sim = new RevenueSimulator();
  private elasticity = new ElasticityModel();

  forecast(params: {
    bidders: any[];
    floor: number;
    traffic: number;
    geo: string;
    segment: string;
  }) {
    const base = this.sim.simulate(params.bidders, {
      floor: params.floor,
      geo: params.geo,
      segment: params.segment,
      trafficVolume: params.traffic,
    });

    const uplift = this.elasticity.estimateRevenueChange(
      base.revenue,
      0.1 // simulated +10% floor scenario
    );

    return {
      baselineRevenue: base.revenue,
      projectedRevenue: uplift,
      delta: uplift - base.revenue,
      fillRate: base.fillRate,
      avgCPM: base.avgCPM,
    };
  }
}

type BidderSim = {
  id: string;
  bid: number;
  quality: number;
  geo?: string;
  segment?: string;
};

type SimulationContext = {
  floor: number;
  geo: string;
  segment: string;
  trafficVolume: number;
};

export class RevenueSimulator {
  simulate(bidders: BidderSim[], ctx: SimulationContext) {
    let revenue = 0;
    let impressions = 0;
    let rejected = 0;

    const eligible: BidderSim[] = [];

    // 1. FLOOR FILTER
    for (const b of bidders) {
      if (b.bid >= ctx.floor) {
        eligible.push(b);
      } else {
        rejected++;
      }
    }

    // 2. AUCTION (deterministic ranking)
    eligible.sort((a, b) => {
      const sa = a.bid * a.quality;
      const sb = b.bid * b.quality;
      return sb - sa;
    });

    // 3. WIN SIMULATION
    for (let i = 0; i < ctx.trafficVolume; i++) {
      const winner = eligible[0];
      if (!winner) continue;

      const price = winner.bid;

      revenue += price;
      impressions++;
    }

    return {
      revenue,
      impressions,
      fillRate: impressions / ctx.trafficVolume,
      rejectionRate: rejected / Math.max(1, bidders.length),
      avgCPM: impressions > 0 ? (revenue / impressions) * 1000 : 0,
    };
  }
}

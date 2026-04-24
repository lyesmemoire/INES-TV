import { AuctionResult } from "../../services/adBrain.service.js";

export class YieldSignalExtractor {
  static extract(result: AuctionResult, totalBidders: number, geo: string, segment: string, subFloorCandidates: any[]) {
    const floorPressure = subFloorCandidates.length / Math.max(1, totalBidders);

    const avgSubFloorRatio = subFloorCandidates.length > 0
      ? subFloorCandidates.reduce((a, b) => a + b.ratio, 0) / subFloorCandidates.length
      : 0;

    return {
      geo,
      segment,
      floorPressure,
      avgSubFloorRatio,
      demandSignal:
        floorPressure > 0.3 ? "UNDERPRICED" :
        floorPressure < 0.05 ? "OVERPRICED" :
        "BALANCED" as const,
    };
  }
}

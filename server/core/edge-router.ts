import { Request } from "express";

export type Region = "eu-west-1" | "us-east-1" | "ap-south-1";

export const REGIONS: Region[] = ["eu-west-1", "us-east-1", "ap-south-1"];

/**
 * Enterprise Edge Router (Level 6 Simulation)
 * Maps requests to logical regions with simulated latency logic.
 */
export const EdgeRouter = {
  resolveRegion(req: Request): Region {
    const header = req.headers["x-region"] as Region;
    if (header && REGIONS.includes(header)) return header;

    const ip = req.ip || "127.0.0.1";

    // 🌐 SIMULATED IP GEOLOCATION HEURISTIC
    if (ip.startsWith("18.") || ip.startsWith("34.")) return "us-east-1";
    if (ip.startsWith("52.") || ip.startsWith("13.")) return "eu-west-1";
    if (ip.startsWith("103.") || ip.startsWith("116.")) return "ap-south-1";

    return "eu-west-1"; // Default Edge Zone
  },

  /**
   * Network Latency Matrix (ms)
   * Simulated inter-region replication delay.
   */
  getLatency(from: Region, to: Region): number {
    if (from === to) return 5; // Local edge hop

    const matrix: Record<Region, Record<string, number>> = {
      "eu-west-1": { "us-east-1": 90, "ap-south-1": 150 },
      "us-east-1": { "eu-west-1": 90, "ap-south-1": 200 },
      "ap-south-1": { "eu-west-1": 150, "us-east-1": 200 }
    };

    return matrix[from][to] || 120;
  }
};

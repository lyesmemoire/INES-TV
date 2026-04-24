import os from "os";
import { PlanStore } from "../core/memory/PlanStore.js";
import { AnalyticsStore } from "../core/memory/AnalyticsStore.js";
import { Request, Response, NextFunction } from "express";

let activeRequests = 0;
const HARD_LIMIT = 10000;
const SOFT_LIMIT = 8000;
const CPU_COUNT = os.cpus().length;

/**
 * 🛑 SAFE-FLOW TIERED BACKPRESSURE
 * Protects PRO/SCALE users during traffic spikes.
 */
export function backpressure(req: Request, res: Response, next: NextFunction) {
  // 🔑 OPS BYPASS
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === "production_stress_test_key") {
    activeRequests++;
    res.on("finish", () => {
      activeRequests--;
    });
    return next();
  }

  const cpuSaturation = os.loadavg()[0] / CPU_COUNT;

  // 1. HARD CAP: Absolute protection
  if (activeRequests >= HARD_LIMIT || cpuSaturation > 0.95) {
    return res.status(503).send("System overloaded. Please try again later.");
  }

  // 2. SOFT CAP: Tier-Aware Shedding (Staff+ Logic)
  if (activeRequests >= SOFT_LIMIT || cpuSaturation > 0.85) {
    // ⚡ O(1) Memory Plan Lookup
    const pid = (req.headers["x-sp-pid"] || req.query.pid) as string || "anonymous";
    
    // 🛡️ FLOW-SAFE VALIDATION
    // Treat unknown PIDs as FREE rather than immediate rejection
    // Valid tenants always follow their tier logic
    const { plan } = PlanStore.isValidTenant(pid) 
      ? PlanStore.getQuota(pid) 
      : { plan: 0 }; // Default to FREE for unknown
    
    if (plan === 0) { // FREE Tier Shedding
      PlanStore.recordBlock(pid, 'LOAD');
      AnalyticsStore.recordBlocked(); // 🔒 Static → shared buffer, cluster-safe
      return res.status(503).json({
        error: "SYSTEM_LOAD_HIGH",
        message: "Free tier request shed due to high system load. Priority given to PRO/SCALE tenants.",
        tier: "FREE"
      });
    }
  }

  activeRequests++;

  res.on("finish", () => {
    activeRequests--;
  });

  next();
}

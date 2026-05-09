import { Router, Request, Response } from "express";
import { analyticsStore } from "../core/memory/AnalyticsStore.js";
import { AnalyticsStore } from "../core/memory/AnalyticsStore.js";
import { PlanStore } from "../core/memory/PlanStore.js";

const router = Router();

// Global system stats (admin/monitoring use)
router.get("/", (_req: Request, res: Response) => {
  res.json(analyticsStore.getStats());
});

router.get("/live", (_req: Request, res: Response) => {
  res.json(analyticsStore.getStats());
});

// 💰 REVENUE INSIGHTS (Publisher-Level, per PID)
// Uses real observed RPM + differentiated block reasons
router.get("/insights/:pid", (req: Request, res: Response) => {
  const pid = req.params.pid as string;
  const globalStats = analyticsStore.getStats();
  const pubStats = PlanStore.getAnalytics(pid);
  const { plan } = PlanStore.getQuota(pid);

  // Real RPM math — based on actually observed global RPM, not estimate
  const rpm = globalStats.rpm;
  const lostRevenueLoad = (pubStats.loadBlocks / 1000) * rpm;
  const lostRevenueQuota = (pubStats.quotaBlocks / 1000) * rpm;
  const lostRevenueTotal = lostRevenueLoad + lostRevenueQuota;

  const totalServed = pubStats.imps + pubStats.loadBlocks + pubStats.quotaBlocks;
  const efficiencyScore = totalServed > 0
    ? (pubStats.imps / totalServed * 100).toFixed(1)
    : "100";

  res.json({
    pid,
    plan,
    impressions: pubStats.imps,
    blocked: {
      load: pubStats.loadBlocks,
      quota: pubStats.quotaBlocks,
      total: pubStats.loadBlocks + pubStats.quotaBlocks
    },
    rpm,
    lostRevenue: {
      load: Number(lostRevenueLoad.toFixed(4)),
      quota: Number(lostRevenueQuota.toFixed(4)),
      total: Number(lostRevenueTotal.toFixed(4))
    },
    efficiencyScore
  });
});

export default router;

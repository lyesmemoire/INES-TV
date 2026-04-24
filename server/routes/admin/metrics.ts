import express, { Router, Request, Response } from 'express';
import { computeMetrics } from "../../services/metrics.service";
import { requireAuth, requireAdmin } from "../../middleware/supabaseAuth.middleware";

const router = express.Router();

/**
 * GET /api/admin/metrics
 * Returns the unified business metrics (MRR, ARPU, LTV, Churn, Ads).
 * Protected: Admin only.
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const metrics = await computeMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

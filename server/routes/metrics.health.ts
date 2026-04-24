import { Router } from "express"
import { getMetrics } from "../services/metrics.service.js"
import { sendAlert } from "../services/alert.service.js"
import { requireAuth, requireAdmin } from "../middleware/supabaseAuth.middleware.js"
import { cache } from "../lib/cache.js"

const router = Router()

const SLA = {
  maxLatency: 1500,
  maxErrorRate: 0.05,
  minActiveStreams: 1
}

router.get("/", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const tenantId = req.user?.tenantId
    const cacheKey = `health:global${tenantId ? ':' + tenantId : ''}`

    const cached = await cache.get(cacheKey);
    if (cached) return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);

    const metrics = await getMetrics(tenantId)

    const checks = {
      latency:
        metrics.avgLatency > SLA.maxLatency ? "critical" : "ok",

      errors:
        metrics.errorRate > SLA.maxErrorRate ? "warning" : "ok",

      streams:
        metrics.activeStreams < SLA.minActiveStreams ? "warning" : "ok"
    }

    let status: "ok" | "warning" | "critical" = "ok"

    if (Object.values(checks).includes("critical")) {
      status = "critical"
    } else if (Object.values(checks).includes("warning")) {
      status = "warning"
    }

    // 🚨 Trigger alert
    if (status !== "ok") {
      await sendAlert("SYSTEM_HEALTH_" + status.toUpperCase(), {
        metrics,
        checks
      }, status.toUpperCase())
    }

    const payload = {
      status,
      checks,
      metrics
    }

    await cache.set(cacheKey, JSON.stringify(payload), 5); // 5s Cache

    res.json(payload)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Health check failed" })
  }
})

export default router

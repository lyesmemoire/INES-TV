import { PrismaClient } from "@prisma/client"
import { getMetrics } from "../services/metrics.service.js"
import { evaluateMetrics } from "../alerts/ruleEngine.js"

const prisma = new PrismaClient()

export function startMetricsCron() {
  console.log("📊 Metrics Cron Started (every 60s)")

  setInterval(async () => {
    try {
      const metrics = await getMetrics()

      await prisma.metricsSnapshot.create({
        data: {
          activeStreams: metrics.activeStreams,
          errorRate: metrics.errorRate,
          avgLatency: metrics.avgLatency
        }
      })

      // 🔥 4. AI/SLA Rule Engine hook
      // In a real B2B Multi-tenant system we'd loop through all Active Tenants here
      // but since we are proving the capability we'll trigger evaluating globally or per-tenant.
      // E.g.: await evaluateMetrics(metrics, "global-tenant");
      await evaluateMetrics(metrics, "global-tenant");

      console.log("✅ Metrics snapshot stored")
    } catch (err) {
      console.error("❌ Metrics cron failed:", err)
    }
  }, 60000)
}

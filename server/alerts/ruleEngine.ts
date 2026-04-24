import { PrismaClient } from "@prisma/client"
import { triggerAlert } from "./trigger.js"

export async function evaluateMetrics(metrics: any, tenantId: string) {
  // ERROR RATE RULE
  if (metrics.errorRate > 0.05) { // Adjusted from 5 to 0.05 based on the standard errorRate implementation which is a decimal, wait, I'll pass 5. Actually `0.05` is mathematically safest.
    await triggerAlert({
      tenantId,
      type: "ERROR_RATE",
      severity: "CRITICAL",
      title: "High Error Rate Detected",
      message: `Error rate at ${(metrics.errorRate * 100).toFixed(2)}%`,
      metric: "errorRate",
      value: metrics.errorRate,
      threshold: 0.05,
    })
  }

  // LATENCY RULE
  if (metrics.avgLatency > 1500) {
    await triggerAlert({
      tenantId,
      type: "LATENCY",
      severity: "WARNING",
      title: "High Latency Detected",
      message: `Latency at ${metrics.avgLatency}ms`,
      metric: "latency",
      value: metrics.avgLatency,
      threshold: 1500,
    })
  }

  // QUOTA RULE (If passed in metrics)
  if (metrics.quotaUsage && metrics.quotaUsage > 90) {
    await triggerAlert({
      tenantId,
      type: "QUOTA",
      severity: "INFO",
      title: "Quota Near Limit",
      message: `Usage at ${metrics.quotaUsage}%`,
      metric: "quota",
      value: metrics.quotaUsage,
      threshold: 90,
    })
  }
}

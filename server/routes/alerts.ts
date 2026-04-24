import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import { requireAuth, requireAdmin } from "../middleware/supabaseAuth.middleware.js"

import { cache } from "../lib/cache.js"
 
const prisma = new PrismaClient()
const router = Router()
 
router.get("/", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const tenantId = req.user?.tenantId
    const cacheKey = `alerts:global${tenantId ? ':' + tenantId : ''}`
 
    const cached = await cache.get(cacheKey)
    if (cached) return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached)
 
    const whereBase: any = {}
    if (tenantId) whereBase.tenantId = tenantId
 
    const alerts = await prisma.alert.findMany({
      where: whereBase,
      orderBy: { createdAt: "desc" },
      take: 50,
    })
 
    await cache.set(cacheKey, JSON.stringify(alerts), 10); // Phase 7: 10s TTL
 
    res.json(alerts)
  } catch (err) {
    console.error("Alerts API Error:", err)
    res.status(500).json({ error: "Failed to load alerts" })
  }
})

// 🧪 Phase 6: Manual Alert Test (OPS only)
router.post("/test", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { sendAlert } = await import("../services/alert.service.js");
    await sendAlert("TEST_ALERT", {
      source: "manual",
      triggeredBy: req.user?.id || "ops",
      timestamp: new Date().toISOString(),
      message: "🧪 This is a test alert from StreamPerf OPS"
    }, "WARNING");

    res.json({ 
      status: "sent",
      message: "Test alert dispatched. Check Slack/webhook/logs."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
})

export default router

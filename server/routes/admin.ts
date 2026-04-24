import { Router } from "express"
import { getAdminMetrics } from "../services/admin.service"
import { createCode } from "../services/code.service"

const router = Router()

// 🔐 simple protection
const ADMIN_KEY = process.env.ADMIN_KEY;

router.post("/code/create", async (req, res) => {
  const { key, days } = req.body;

  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: "UNAUTHORIZED" });
  }

  const code = await createCode(days || 30);

  res.json({ code });
});

// 🔥 LIVE METRICS
router.get("/engine/live", async (req, res) => {
  try {
    const data = await getAdminMetrics()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: "ADMIN_METRICS_FAILED" })
  }
})

export default router

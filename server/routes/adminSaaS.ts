import { Router } from "express";
import { hybridAuth } from "../admin/auth/hybridAuth.js";
import { AdminUsersService } from "../admin/users/users.service.js";
import { AdminAdsService } from "../admin/ads/ads.service.ts";
import { AdminStreamsService } from "../admin/streams/streams.service.js";
import { BlackoutService, BlackoutMode } from "../admin/system/blackout.service.js";
import { prisma } from "../services/db.js";

/**
 * 📁 /server/routes/adminSaaS.ts
 * Unified SaaS Admin Control Plane API.
 * All routes protected by hybridAuth.
 */
const router = Router();

router.use(hybridAuth);

/**
 * 📊 SYSTEM STATS
 */
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, premiumUsers, streams] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { isPremium: true, deletedAt: null } }),
      prisma.channel.count({ where: { isActive: true, deletedAt: null } })
    ]);

    const blackoutMode = await BlackoutService.getMode();

    res.json({
      users: { total: totalUsers, premium: premiumUsers },
      streams: { active: streams },
      system: { blackoutMode, pressureAvg: 0.72 } // Mock pressure for now
    });
  } catch (error) {
    res.status(500).json({ error: "STATS_FETCH_FAILED" });
  }
});

/**
 * 👤 USER MANAGEMENT
 */
router.get("/users", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const plan = req.query.plan as string;
  const users = await AdminUsersService.listUsers(page, plan);
  res.json(users);
});

router.post("/users/plan", async (req, res) => {
  const { userId, plan } = req.body;
  const user = await AdminUsersService.setPlan(userId, plan);
  res.json(user);
});

/**
 * 💰 ADX & BLACKOUT CONTROL
 */
router.get("/ads/house", async (req, res) => {
  const ads = await AdminAdsService.listHouseAds();
  res.json(ads);
});

router.post("/system/panic", async (req, res) => {
  const { mode } = req.body as { mode: BlackoutMode };
  await BlackoutService.setMode(mode);
  res.json({ success: true, mode });
});

/**
 * 📺 STREAM ORCHESTRATION
 */
router.get("/streams", async (req, res) => {
  const streams = await AdminStreamsService.listActive();
  res.json(streams);
});

router.delete("/streams/:id", async (req, res) => {
  await AdminStreamsService.softDelete(req.params.id);
  res.json({ success: true });
});

export default router;

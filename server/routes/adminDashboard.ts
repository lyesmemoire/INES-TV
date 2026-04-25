import express, { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../services/db";
import cache from "../lib/cache";
import logger from "../services/logger";

const router = express.Router();

const verifyAdminJWT = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-default-key-change-it-in-prod');
    (req as any).user = { role: "ADMIN", id: (payload as any).adminId };
    next();
  } catch (err) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
};

/**
 * GET /api/admin/stats
 * Returns: active users, stream count, error rate, bandwidth estimate.
 * No AI, no heatmaps, no predictions.
 */
router.get("/stats", verifyAdminJWT, async (req: Request, res: Response) => {
  try {
    const [totalUsers, bannedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    // Count active stream sessions
    const sessionKeys = await cache.keys("sessions:*");
    let activeStreams = 0;
    for (const key of sessionKeys) {
      activeStreams += await cache.scard(key);
    }
    const bandwidthEstimateMbps = activeStreams * 4; // ~4 Mbps avg per HLS stream

    // Error rate: N/A in Phase 1 (logs are console-only)
    // Connect a log aggregator in Phase 2 to get real error rates.
    const errorRate = "see-logs";

    return res.json({
      totalUsers,
      bannedUsers,
      activeStreams,
      bandwidthEstimateMbps,
      errorRate24h: errorRate,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error(`[Admin] /stats failed: ${err.message}`);
    return res.status(500).json({ error: "Internal error" });
  }
});

/**
 * GET /api/admin/users
 * Simple paginated user list.
 */
router.get("/users", verifyAdminJWT, async (req: Request, res: Response) => {

  const page = Number(req.query.page) || 1;
  const limit = 50;

  try {
    const users = await prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        plan: true,
        isBanned: true,
        createdAt: true,
      },
    });
    return res.json({ users, page });
  } catch (err: any) {
    logger.error(`[Admin] /users failed: ${err.message}`);
    return res.status(500).json({ error: "Internal error" });
  }
});

/**
 * POST /api/admin/ban
 * Ban or unban a user.
 */
router.post("/ban", verifyAdminJWT, async (req: Request, res: Response) => {

  const { userId, banned } = req.body as { userId: string; banned: boolean };
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: banned },
    });
    logger.info(`[Admin] User ${userId} banned=${banned} by ${req.user!.id}`);
    return res.json({ ok: true, userId, banned });
  } catch (err: any) {
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ── Analytics Hub Aggregators ──────────────────────────────────────────────

/**
 * GET /api/admin/dashboard/ads
 * Aggregate ad events (impressions vs clicks)
 */
router.get("/dashboard/ads", verifyAdminJWT, async (req: Request, res: Response) => {
  try {
    const events = await prisma.adEvent.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
      }
    });

    // Grouping logic (simplified for SQLite/Postgres performance)
    const statsMap: Record<string, { provider: string, platform: string, impressions: number, clicks: number }> = {};

    events.forEach(e => {
      if (!statsMap[e.provider]) {
        statsMap[e.provider] = { provider: e.provider, platform: e.segment || "unknown", impressions: 0, clicks: 0 };
      }
      if (e.eventType === "impression") statsMap[e.provider].impressions++;
      if (e.eventType === "click") statsMap[e.provider].clicks++;
    });

    const result = Object.values(statsMap).map(s => ({
      ...s,
      ctr: s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0
    }));

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "ADS_METRICS_ERROR" });
  }
});

/**
 * GET /api/admin/dashboard/streams
 * Aggregate stream events
 */
router.get("/dashboard/streams", verifyAdminJWT, async (req: Request, res: Response) => {
  try {
    const events = await prisma.streamEvent.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    const statsMap: Record<string, { plays: number, errors: number, watchTime: number }> = {};

    events.forEach(e => {
      if (!statsMap[e.channelId]) {
        statsMap[e.channelId] = { plays: 0, errors: 0, watchTime: 0 };
      }
      if (e.eventType === "play") statsMap[e.channelId].plays++;
      if (e.eventType === "error") statsMap[e.channelId].errors++;
      if (e.watchTime) statsMap[e.channelId].watchTime += e.watchTime;
    });

    return res.json(statsMap);
  } catch (err: any) {
    return res.status(500).json({ error: "STREAM_METRICS_ERROR" });
  }
});

// ── Missing Dashboard Endpoints (Mocked for UI) ──────────────────────────────────────────────

router.get("/ads-summary", verifyAdminJWT, (req, res) => {
  res.json({
    today: { fillRate: 85, globalCtr: 2.4 },
    providers: [
      { id: 1, provider: "Google AdManager", fillRate: 92, impressions: "1.2M", ctr: 2.8 },
      { id: 2, provider: "AppLovin", fillRate: 78, impressions: "450K", ctr: 1.9 }
    ]
  });
});

router.get("/revenue-summary", verifyAdminJWT, (req, res) => {
  res.json({
    totalUsers: "14,029",
    todayAdRevenue: "3,402",
    graph: [
      { date: "Mon", revenue: 1200 },
      { date: "Tue", revenue: 2100 },
      { date: "Wed", revenue: 1800 },
      { date: "Thu", revenue: 2900 },
      { date: "Fri", revenue: 2400 },
      { date: "Sat", revenue: 3100 },
      { date: "Sun", revenue: 3402 }
    ],
    arpu: 0.24,
    premiumUsers: "1,204"
  });
});

router.get("/user-engagement", verifyAdminJWT, (req, res) => {
  res.json({
    avgWatchTimeUser24hMins: 42,
    totalWatchTime24hHours: "8,902"
  });
});

router.get("/system-health", verifyAdminJWT, (req, res) => {
  res.json({
    status: "OK"
  });
});

export default router;

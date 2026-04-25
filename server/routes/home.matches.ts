import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

/**
 * 🟢 READ-ONLY HOME API
 * Isolated from SRE / Event Log / Chaos Engine.
 * Fetches directly from Prisma.
 */
router.get("/", async (req, res) => {
  try {
    const live = await prisma.channel.findMany({
      where: { status: "LIVE", isActive: true, deletedAt: null },
      take: 10,
      orderBy: { viewers: "desc" }
    });

    const upcoming = await prisma.channel.findMany({
      where: { status: "UPCOMING", isActive: true, deletedAt: null },
      take: 10,
      orderBy: { matchTime: "asc" }
    });

    return res.json({ live, upcoming });
  } catch (error) {
    console.error("🚨 [Home API] Error fetching matches:", error);
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;

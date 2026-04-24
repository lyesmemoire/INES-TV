// server/routes/streams.ts

import express from "express"
import { Response } from "express"
import crypto from "crypto"
import {
  createSession,
  heartbeat,
  releaseSession,
  pickBestSource,
  Source
} from "../services/loadBalancer.service"

import { generateUltraToken } from "../services/signedStreamUrl.service"
import { getAdConfig, getAdStrategy } from "../services/ads.service"
import { trackSession } from "../services/profile.service"
import { detectAbuse } from "../services/security.service"
import { redis } from "../services/redis.service"
import sourcesData from "../data/sources.json"
const sources = sourcesData as unknown as Record<string, { sources: Source[] }>

export function buildFingerprint(req: any) {
  return crypto
    .createHash("sha256")
    .update((req.headers["user-agent"] || "") + req.ip)
    .digest("hex");
}

import { isKilled } from "../services/admin.service"
import { optionalAuth, AuthRequest } from "../middleware/supabaseAuth.middleware"
import { canStream } from "../services/streamSession.service"


const router = express.Router()

// ─── PLAY ───────────────────────────────

router.post("/play", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (isKilled()) {
      return res.status(503).json({ error: "PROCESS_PAUSED" })
    }

    const { channelId, sessionId } = req.body

    // 🎬 Enforce stream concurrency limits (FREE=1, BASIC=2, PREMIUM=∞)
    if (req.user) {
      const allowed = await canStream(req.user.id);

      if (!allowed) {
        return res.status(403).json({
          error: "STREAM_LIMIT_REACHED",
        });
      }
    }

    const channelData = sources[channelId]
    if (!channelData || !channelData.sources.length) {
      return res.status(404).json({ error: "NO_SOURCE" })
    }

    const source = await pickBestSource(channelData.sources)

    const ip =
      (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "0.0.0.0"

    if (await detectAbuse(ip)) {
      return res.status(403).json({ error: "BLOCKED" });
    }

    const key = `rate:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      if (typeof redis.expire === "function") {
        await redis.expire(key, 10);
      }
    }
    if (count > 20) {
      return res.status(429).json({ error: "RATE_LIMIT" });
    }

    const fingerprint = buildFingerprint(req);

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: req.user?.id || "anonymous",
        fingerprint,
        ip,
      }),
      "EX", 120
    );

    await trackSession(sessionId);

    const token = generateUltraToken({
      sessionId,
      ip,
      sourceUrl: source.url,
    })

    const adConfig = getAdConfig(req.user)
    const adStrategy = getAdStrategy(req.user)

    return res.json({
      adStrategy,
      streamUrl: `/edge/stream?token=${token}`,
      sessionId,
      adConfig
    })
  } catch (err) {
    console.error("PLAY ERROR", err)
    return res.status(500).json({ error: "STREAM_ERROR" })
  }
})

// ─── HEARTBEAT ─────────────────────────

router.post("/heartbeat", async (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) return res.status(400).json({ error: "NO_SESSION" })

  await heartbeat(sessionId)
  return res.json({ success: true })
})

// ─── STOP ──────────────────────────────

router.post("/stop", async (req, res) => {
  const { sessionId } = req.body
  if (sessionId) {
    await releaseSession(sessionId)
  }
  return res.json({ success: true })
})

export default router

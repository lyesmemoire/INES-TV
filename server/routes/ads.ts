import { Router } from "express"
import { AdBrain } from "../services/adBrain.service"
import { ShadowAuctionRunner } from "../services/shadowMode.service.js"
import { MarketSimulator } from "../services/marketSimulator.service.js"
import { EconomicAutopilot } from "../services/economicPilot.service.js"
import { AdTokenStore } from "../services/adTokenStore.service"
import { AdFraudService } from "../services/adFraud.service"
import { getUserSegment } from "../services/segment.service"
import { InternalMarketplace } from "../services/internalMarketplace.service"
import { analyticsStore } from "../core/memory/AnalyticsStore"
import { prisma } from "../lib/prisma"

// 🚀 ENGAGE AUTOMATIC PILOT
EconomicAutopilot.start();

const router = Router()

// --- Internal Bidders (SSP-lite setup) ---
const INTERNAL_BIDDERS = [
  { id: "internal_prime", baseEcpm: 1.25, reliability: 0.98, avgLatency: 8 },
  { id: "partner_beta", baseEcpm: 0.95, reliability: 0.85, avgLatency: 22 },
  { id: "house_fallback", baseEcpm: 0.5, reliability: 1.0, avgLatency: 4 }
]

// --- Mapping Helpers ---
function mapGeo(country: string): any {
  if (country === "US") return "US"
  if (["FR", "DE", "ES", "IT", "UK"].includes(country)) return "EU"
  if (country === "MA") return "MA"
  if (country === "TN") return "TN"
  if (country === "DZ") return "DZ"
  return "OTHER"
}

function mapSegment(seg: string): any {
  const s = seg.toUpperCase()
  if (s === "PREMIUM") return "PREMIUM"
  if (s === "LOW") return "LOW"
  return "STANDARD"
}

/**
 * ⚡ ADS GATEWAY: /ad/request (AdX v2.0 - Ultra Performance)
 */
router.post("/ad/request", async (req: any, res: any) => {
    let winner: import("../services/adBrain.service").AuctionResult | null = null;
    const start = performance.now();
  try {
    // 🛡️ ANTI-FRAUD: Bot Detection
    const ua = req.headers["user-agent"] || "";
    if (AdFraudService.isBot(ua)) {
       return res.status(403).json([null, 0, null, "bot_detected"]);
    }

    const geo = mapGeo(req.headers["cf-ipcountry"] || "XX");
    const rawSegment = getUserSegment(req);
    const device = req.headers['sec-ch-ua-mobile'] === '?1' ? 'MOBILE' : 'DESKTOP';

    // 📊 ANALYTICS: Track Request (for fillRate)
    analyticsStore.add(geo, "request", 0, 0);
    
    const ctx: import("../services/adBrain.service").BidContext = {
      userId: req.user?.id || "anon",
      tenantId: req.headers["x-tenant-id"] || "demo_pub",
      geo: geo as any,
      segment: mapSegment(rawSegment),
      device,
      qoeScore: (Number(req.headers["x-qoe"]) || 100) / 100,
      trustScore: 1.0 // Simplified for extreme perf
    };

    // 🏆 Step 1: Unified Demand Cascade (Internal -> 3rd Party -> House)
    winner = AdBrain.resolveAd(ctx);

    // 💰 createToken() - Postgres Transactional Truth
    const adProvider = winner.isFallback ? "house_ad" : (winner.bidderId || "market");
    const token = await AdTokenStore.createToken({
      userId: ctx.userId || "anon",
      tenantId: ctx.tenantId || "demo_pub",
      provider: adProvider,
      ecpmSnapshot: winner.price,
      segment: rawSegment
    });

    const perf = performance.now() - start;

    return res.json([
      winner.bidderId,
      winner.price,
      token,
      perf.toFixed(3) + "ms"
    ]);

  } catch (e) {
    console.error("✕ [AdsRoute] Request failed:", e);
    return res.json({ ad: null });
  } finally {
    // 🔥 CRITICAL: Recycle object into the pool
    if (winner) AdBrain.releaseResult(winner);
  }
})

/**
 * 💸 REVENUE COMMIT: /ad/impression (Async)
 */
router.post("/ad/impression", async (req: any, res: any) => {
  try {
    const { token } = req.body

    const ledgerEntry = await AdTokenStore.consumeToken(token)
    if (!ledgerEntry) return res.status(403).json({ ok: false })

    prisma.adEvent.create({
      data: {
        userId: ledgerEntry.userId,
        tenantId: ledgerEntry.tenantId || "demo_pub",
        provider: ledgerEntry.provider,
        revenue: ledgerEntry.ecpmSnapshot,
        eventType: "impression",
        idempotencyKey: ledgerEntry.tokenHash
      }
    }).catch(() => {})

    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false })
  }
})

export default router

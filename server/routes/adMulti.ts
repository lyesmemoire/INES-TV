import { Router } from "express";
import { slotCache } from "../core/memory/SlotCache.js";
import { AdBrain, BidContext } from "../services/adBrain.service.js";
import { adContext, computeMultipliers } from "../middleware/adContext.middleware.js";
import { adFallbackQueue } from "../services/adFallbackQueue.service.js";

const router = Router();

// 🔥 MICRO-CACHE (Staff+ Level Optimization)
let lastCache: Map<string, { ts: number, data: any }> = new Map();

router.get("/native-feed", adContext, async (req, res) => {
  const pid = (req as any).adContext.tenantId || "demo_pub";
  const slots = slotCache.getSlots(pid);
  const ads: any[] = [];
  
  // Minimal native auction logic for the hybrid feed
  for (let i = 0; i < 5; i++) { // Fetch top 5 ads
    // 🧠 SERVER-CONTROLLED PRICING (Multiplier per index)
    const ctx = await computeMultipliers(req, i);
    const winner = AdBrain.runAuction(ctx);
    
    if (!winner.isFallback) {
      ads.push({
        id: winner.bidderId,
        title: "Sponsored Content",
        cta: "Learn More",
        ad: winner
      });
    } else {
      // ⚡ ASYNC TIER-4 TRIGGER (Non-blocking)
      adFallbackQueue.enqueue(winner.bidderId || "native-slot", ctx);
    }
  }
  res.json(ads);
});

router.get("/:pid", adContext, (req, res) => {
  const pid = req.params.pid as string;
  const now = Date.now();

  // 1. Check Micro-cache (50ms) to prevent thunderous herd in a cluster
  const cached = lastCache.get(pid);
  if (cached && (now - cached.ts < 50)) {
    return res.json(cached.data);
  }

  const slots = slotCache.getSlots(pid);
  const len = slots.length;
  const results: any[] = [];

  // Dummy context for auction (In a real app, this would come from headers/GeoIP)
  const baseCtx: BidContext = {
    userId: "anonymous",
    tenantId: pid,
    geo: "MA", // Default to MA for this demo/region
    segment: "STANDARD",
    device: "DESKTOP",
    qoeScore: 1.0,
    trustScore: 1.0
  };

  try {
    for (let i = 0; i < len; i++) {
      const slot = slots[i];
      if (!slot.active) continue;

      const winner = AdBrain.runAuction((req as any).adContext);
      
      if (winner.isFallback) {
        // ⚡ ASYNC TIER-4 TRIGGER (Non-blocking)
        adFallbackQueue.enqueue(slot.id, (req as any).adContext);
      }

      results.push({
        slotId: slot.id,
        selector: slot.selector,
        format: slot.format,
        ad: winner
      });
    }

    // Update Micro-cache
    lastCache.set(pid, { ts: now, data: results });
    res.json(results);
  } finally {
    // 🔥 CRITICAL: Recycle all objects into the pool
    for (const r of results) {
      if (r.ad) AdBrain.releaseResult(r.ad);
    }
  }
});

export default router;

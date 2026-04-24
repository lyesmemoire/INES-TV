import { Router } from "express";
import { FeedOrchestrator } from "../core/FeedOrchestrator.js";
import { adContext } from "../middleware/adContext.middleware.js";

/**
 * 📁 /server/routes/feed.ts
 * Real-Time Feed Delivery Engine.
 */
const router = Router();

router.get("/home", adContext, async (req: any, res) => {
  try {
    const userRole = req.adContext?.isPremium ? "PREMIUM" : "USER";
    const layout = await FeedOrchestrator.buildHomeFeed(userRole);
    
    res.json(layout);
  } catch (error) {
    console.error("✕ [FeedRoute] Layout generation failed:", error);
    res.status(500).json({ error: "Feed unavailable" });
  }
});

export default router;

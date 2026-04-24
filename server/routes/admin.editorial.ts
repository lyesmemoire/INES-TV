import { Router } from "express";
import { EditorialService } from "../admin/editorial/editorial.service.js";
import { hybridAuth } from "../admin/auth/hybridAuth.js";

/**
 * 📁 /server/routes/admin.editorial.ts
 * Editorial OS API for Hero curation and stream distribution.
 * Protected by hybridAuth (Supabase RBAC + Admin Secret).
 */
const router = Router();

router.use(hybridAuth);

/**
 * 🏆 PIN MATCH TO TOP
 */
router.post("/feature", async (req, res) => {
  try {
    const { channelId, position } = req.body;
    const result = await EditorialService.featureMatch(channelId, position || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "FEATURE_MATCH_FAILED" });
  }
});

/**
 * ❌ UNPIN MATCH
 */
router.post("/unfeature", async (req, res) => {
  try {
    const { channelId } = req.body;
    await EditorialService.unfeatureMatch(channelId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "UNFEATURE_MATCH_FAILED" });
  }
});

/**
 * 📡 ADD STREAM DISTRIBUTOR (Facebook / iFrame)
 */
router.post("/stream", async (req, res) => {
  try {
    const { channelId, type, url } = req.body;
    const result = await EditorialService.addStream(channelId, type, url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "ADD_STREAM_FAILED" });
  }
});

/**
 * 📺 GET MATCH STREAMS
 */
router.get("/streams/:channelId", async (req, res) => {
  try {
    const streams = await EditorialService.getStreams(req.params.channelId);
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: "GET_STREAMS_FAILED" });
  }
});

export default router;

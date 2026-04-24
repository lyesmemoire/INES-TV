import { Router } from "express";
import { hybridAuth } from "../admin/auth/hybridAuth.js";
import { liveSourceRegistry } from "../services/LiveSourceRegistry.js";

const router = Router();

// Protected by Supabase RBAC + Admin Secret
router.use(hybridAuth);

/**
 * 🔗 /api/admin/live-sources/:channelId/source
 * Add a new streaming source origin.
 */
router.post("/:channelId/source", async (req, res) => {
  try {
    const source = await liveSourceRegistry.addSource({
      channelId: req.params.channelId,
      ...req.body
    });
    res.json(source);
  } catch (err) {
    res.status(500).json({ error: "Failed to add source" });
  }
});

/**
 * 📋 /api/admin/live-sources/:channelId/sources
 * List all active sources for a channel.
 */
router.get("/:channelId/sources", async (req, res) => {
  try {
    const sources = await liveSourceRegistry.getSources(req.params.channelId);
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sources" });
  }
});

/**
 * 🛠️ /api/admin/live-sources/source/:id
 * Update source configuration or health.
 */
router.patch("/source/:id", async (req, res) => {
  try {
    const source = await liveSourceRegistry.updateSource(req.params.id, req.body);
    res.json(source);
  } catch (err) {
    res.status(500).json({ error: "Failed to update source" });
  }
});

/**
 * 🗑️ /api/admin/live-sources/source/:id
 * Remove a source from the registry.
 */
router.delete("/source/:id", async (req, res) => {
  try {
    await liveSourceRegistry.deleteSource(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete source" });
  }
});

export default router;

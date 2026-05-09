import { Router, Request, Response } from "express";
import { CampaignCache, Campaign } from "../core/memory/CampaignCache.js";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { name, cpm, budget, geo, segment } = req.body;

  if (!name || !cpm || !budget || !geo || !segment) {
    return res.status(400).json({ error: "Missing campaign fields" });
  }

  const newCamp: Campaign = {
    id: `camp_${Date.now()}`,
    name,
    cpm: Number(cpm),
    budget: Number(budget),
    spent: 0,
    geo,
    segment,
    isActive: true
  };
  
  CampaignCache.set(newCamp);
  res.json({ success: true, campaign: newCamp });
});

router.get("/", (_req: Request, res: Response) => {
  res.json({ campaigns: CampaignCache.getAll() }); // Admin sees all (active + paused)
});

router.delete("/:id", (req: Request, res: Response) => {
  CampaignCache.delete(req.params.id as string);
  res.json({ success: true });
});

router.patch("/:id/toggle", (req: Request, res: Response) => {
  const updated = CampaignCache.toggleStatus(req.params.id as string);
  res.json({ success: true, campaign: updated });
});

export default router;

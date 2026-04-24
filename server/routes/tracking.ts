import { Router } from "express";
import { analyticsStore } from "../core/memory/AnalyticsStore.js";

export const trackingRouter = Router();

trackingRouter.post("/impression", (req, res) => {
  const { price } = req.body;

  analyticsStore.recordImpression(Number(price) || 0);

  res.sendStatus(200);
});

trackingRouter.get("/click", (req, res) => {
  const { url } = req.query;

  analyticsStore.recordClick();

  if (url) {
    res.redirect(url as string);
  } else {
    res.redirect("https://example.com");
  }
});

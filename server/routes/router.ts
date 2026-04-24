import express from "express";
import { getBestNode } from "../services/loadBalancer.service";

const router = express.Router();

router.get("/", async (req, res) => {
  const { region } = req.query;

  const node = await getBestNode(region as string);

  res.json({
    nodeUrl: node ? node.url : null,
  });
});

router.get("/fallback", async (req, res) => {
  const node = await getBestNode("EU"); // Defaults to EU for fallback
  res.json({ nodeUrl: node ? node.url : null });
});

export default router;

import { Router } from "express";
import { MeshSimulator, Region } from "../../core/mesh/MeshSimulator";

const router = Router();

/**
 * 💣 CHAOS INJECTION API (Level 7)
 * Used to test system resilience under network partitions and node failures.
 */
router.post("/node-down", (req, res) => {
  const { nodeId } = req.body;
  MeshSimulator.injectFailure('NODE_DOWN', nodeId);
  res.json({ message: `Node ${nodeId} is now DOWN` });
});

router.post("/partition", (req, res) => {
  const { region1, region2 } = req.body;
  MeshSimulator.injectFailure('PARTITION', region1 as Region, region2 as Region);
  res.json({ message: `Network PARTITION injected between ${region1} and ${region2}` });
});

router.get("/status", (req, res) => {
  // Return simulated mesh health
  res.json({
    status: "Simulation Active",
    nodes: 100,
    regions: ["eu-west-1", "us-east-1", "ap-south-1"],
    resilienceLevel: 7
  });
});

export default router;

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
  res.json({
    status: "Simulation Active",
    engine: "Distributed Systems Emulator v1.0",
    nodes: 100,
    regions: ["eu-west-1", "us-east-1", "ap-south-1"],
    resilienceLevel: 7,
    consistencyModel: "Dynamo-style Quorum (W=2, R=2, N=3)"
  });
});

router.get("/nodes", (req, res) => {
  const nodes = MeshSimulator.getAllNodes();
  res.json(nodes.map(n => ({
    id: n.id,
    region: n.region,
    status: n.status,
    clock: n.clock,
    stateSize: n.state.size
  })));
});

router.get("/latency-map", (req, res) => {
  const regions: Region[] = ["eu-west-1", "us-east-1", "ap-south-1"];
  const map: any = {};
  
  for (const r1 of regions) {
    map[r1] = {};
    for (const r2 of regions) {
      map[r1][r2] = MeshSimulator.getLatency(r1, r2);
    }
  }
  
  res.json(map);
});


export default router;

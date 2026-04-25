import crypto from "crypto";

export type Region = "eu-west-1" | "us-east-1" | "ap-south-1";
export type NodeStatus = "healthy" | "slow" | "partitioned" | "down";

export interface VirtualNode {
  id: string;
  region: Region;
  state: Map<string, any>;
  clock: Record<string, number>; // Vector Clock
  status: NodeStatus;
}

/**
 * Level 7 Distributed Mesh Simulator
 * Simulates high-complexity distributed behaviors (Quorum, Vector Clocks, Chaos).
 */
export class MeshSimulator {
  private static nodes: Map<string, VirtualNode> = new Map();
  private static partitions: Set<string> = new Set(); // Set of "region-region" blocked pairs

  static initialize(nodeCount = 30) {
    const regions: Region[] = ["eu-west-1", "us-east-1", "ap-south-1"];
    for (let i = 0; i < nodeCount; i++) {
      const region = regions[i % regions.length];
      const id = `node-${region}-${i}`;
      this.nodes.set(id, {
        id,
        region,
        state: new Map(),
        clock: {},
        status: "healthy"
      });
    }
    console.log(`📡 [MESH_SIM] Initialized ${nodeCount} virtual nodes across 3 regions.`);
  }

  static getAllNodes() {
    return Array.from(this.nodes.values());
  }

  static getNodesInRegion(region: Region) {
    return Array.from(this.nodes.values()).filter(n => n.region === region && n.status !== "down");
  }

  /**
   * 🛡️ DYNAMO-STYLE QUORUM WRITE (W=2, N=3 per region)
   */
  static async quorumWrite(region: Region, key: string, value: any) {
    const nodes = this.getNodesInRegion(region).slice(0, 3);
    const W = 2;
    let acks = 0;

    for (const node of nodes) {
      if (this.isPartitioned(region, node.region)) continue;
      
      // Update Vector Clock
      node.clock[node.id] = (node.clock[node.id] || 0) + 1;
      node.state.set(key, { value, clock: { ...node.clock }, ts: Date.now() });
      acks++;
    }

    return acks >= W;
  }

  /**
   * 💣 CHAOS ENGINE: Inject Failure
   */
  static injectFailure(type: 'NODE_DOWN' | 'PARTITION', target: string, target2?: string) {
    if (type === 'NODE_DOWN') {
      const node = this.nodes.get(target);
      if (node) node.status = "down";
    } else if (type === 'PARTITION' && target2) {
      this.partitions.add(`${target}:${target2}`);
      this.partitions.add(`${target2}:${target}`);
    }
  }

  static isPartitioned(r1: string, r2: string) {
    return this.partitions.has(`${r1}:${r2}`);
  }

  /**
   * 🌐 SIMULATED NETWORK LATENCY
   */
  static getLatency(from: Region, to: Region): number {
    if (from === to) return 5 + Math.random() * 10;
    const matrix = {
      "eu-west-1": { "us-east-1": 90, "ap-south-1": 150 },
      "us-east-1": { "eu-west-1": 90, "ap-south-1": 200 },
      "ap-south-1": { "eu-west-1": 150, "us-east-1": 200 }
    };
    return (matrix[from]?.[to] || 120) + (Math.random() * 20);
  }
}

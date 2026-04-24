import fs from "fs";
import path from "path";
import { Region, EdgeRouter, REGIONS } from "../core/edge-router";
import { MeshSimulator } from "../core/mesh/MeshSimulator";

const LOG_ROOT = path.join(process.cwd(), "events");

/**
 * Enterprise Regional Event Log (Level 7 Mesh)
 */
export const EventLogService = {
  /**
   * Appends to a REGIONAL hourly segment + Virtual Mesh Quorum
   */
  async append(region: Region, type: string, data: any) {
    const now = new Date();
    const segmentName = `${now.toISOString().split('T')[0]}-${now.getHours()}.log`;
    const regionDir = path.join(LOG_ROOT, region);
    if (!fs.existsSync(regionDir)) fs.mkdirSync(regionDir, { recursive: true });

    const logFile = path.join(regionDir, segmentName);

    const event = {
      type,
      data,
      timestamp: now.getTime(),
      workerId: process.pid,
      region
    };
    
    try {
      // 1. Physical Persistence (Local Segment)
      fs.appendFileSync(logFile, JSON.stringify(event) + "\n");
      
      // 2. 🛡️ VIRTUAL QUORUM WRITE (Level 7)
      const quorumReached = await MeshSimulator.quorumWrite(region, `${type}_${event.timestamp}`, data);
      if (!quorumReached) console.warn(`⚠️ [MESH_${region}] Quorum not reached for event ${type}`);

      // 3. 🌐 ASYNC MESH REPLICATION (Eventual Consistency)
      this.replicateToMesh(region, event);
    } catch (err) {
      console.error(`🚨 [EDGE_${region}] Append FAILED:`, err);
    }
  },

  /**
   * Replicates an event to all other regions with simulated latency
   */
  replicateToMesh(fromRegion: Region, event: any) {
    REGIONS.forEach(toRegion => {
      if (toRegion === fromRegion) return;

      const latency = EdgeRouter.getLatency(fromRegion, toRegion);
      
      // Simulated Async Propagation
      setTimeout(() => {
        const now = new Date();
        const segmentName = `${now.toISOString().split('T')[0]}-${now.getHours()}.log`;
        const regionDir = path.join(LOG_ROOT, toRegion);
        if (!fs.existsSync(regionDir)) fs.mkdirSync(regionDir, { recursive: true });

        const logFile = path.join(regionDir, segmentName);
        
        try {
          // Cross-region events are tagged to prevent feedback loops
          const remoteEvent = { ...event, replicated: true, receivedAt: Date.now() };
          fs.appendFileSync(logFile, JSON.stringify(remoteEvent) + "\n");
        } catch {}
      }, latency);
    });
  },

  async replayRegionSegment(region: Region): Promise<any[]> {
    try {
      const now = new Date();
      const segmentName = `${now.toISOString().split('T')[0]}-${now.getHours()}.log`;
      const logFile = path.join(LOG_ROOT, region, segmentName);

      if (!fs.existsSync(logFile)) return [];
      
      const content = fs.readFileSync(logFile, "utf-8");
      return content.trim().split("\n").map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);
    } catch { return []; }
  },

  async getRegionSnapshot(region: Region): Promise<any> {
    const file = path.join(LOG_ROOT, region, "snapshot.json");
    try {
      if (!fs.existsSync(file)) return null;
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch { return null; }
  },

  async saveRegionSnapshot(region: Region, state: any) {
    const file = path.join(LOG_ROOT, region, "snapshot.json");
    try {
      fs.writeFileSync(file, JSON.stringify({ ...state, updatedAt: Date.now() }));
    } catch {}
  }
};

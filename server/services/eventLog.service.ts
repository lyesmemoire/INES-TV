import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "events");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const SNAPSHOT_FILE = path.join(LOG_DIR, "edge-state.snapshot.json");

/**
 * Enterprise Stateless Event Log (Segmented & Snapshot-backed)
 * Level 5++ Edge Architecture
 */
export const EventLogService = {
  /**
   * Appends to an HOURLY segment to avoid file bloat
   */
  append(type: string, data: any) {
    const now = new Date();
    const segmentName = `${now.toISOString().split('T')[0]}-${now.getHours()}.log`;
    const logFile = path.join(LOG_DIR, segmentName);

    const event = {
      type,
      data,
      timestamp: now.getTime(),
      workerId: process.pid
    };
    
    try {
      fs.appendFileSync(logFile, JSON.stringify(event) + "\n");
    } catch (err) {
      console.error("🚨 [EDGE_LOG] Append FAILED:", err);
    }
  },

  /**
   * Replays events from the CURRENT segment
   */
  async replayCurrentSegment(): Promise<any[]> {
    try {
      const now = new Date();
      const segmentName = `${now.toISOString().split('T')[0]}-${now.getHours()}.log`;
      const logFile = path.join(LOG_DIR, segmentName);

      if (!fs.existsSync(logFile)) return [];
      
      const content = fs.readFileSync(logFile, "utf-8");
      return content.trim().split("\n").map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);
    } catch (err) {
      return [];
    }
  },

  /**
   * Fast Path: Get derived state from the last snapshot
   */
  async getLatestSnapshot(): Promise<any> {
    try {
      if (!fs.existsSync(SNAPSHOT_FILE)) return null;
      const content = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  },

  /**
   * Background Task: Persist a state snapshot every 30s
   */
  async saveSnapshot(state: any) {
    try {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify({
        ...state,
        updatedAt: Date.now()
      }));
    } catch (err) {
      console.error("🚨 [EDGE_LOG] Snapshot save FAILED:", err);
    }
  }
};

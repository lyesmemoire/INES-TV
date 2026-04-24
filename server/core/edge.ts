import { EventLogService } from "../services/eventLog.service";

/**
 * Enterprise Edge State Builder (Level 5++)
 * Optimized with Snapshot-First "Fast Path"
 */
export const EdgeState = {
  /**
   * Rebuilds security context with Fast Path / Fallback
   */
  async getSecurityState(ip: string) {
    // ⚡ FAST PATH: Read from Snapshot
    const snapshot = await EventLogService.getLatestSnapshot();
    const now = Date.now();
    
    // If snapshot is fresh (less than 30s old), use it as base
    if (snapshot && (now - snapshot.updatedAt < 30000)) {
      const ipState = snapshot.security?.[ip] || { rateLimitCount: 0, authFailures: 0 };
      return {
        ...ipState,
        isBlocked: ipState.authFailures >= 5,
        source: 'SNAPSHOT'
      };
    }

    // 🔄 FALLBACK: Replay current hourly segment
    const events = await EventLogService.replayCurrentSegment();
    
    const rateLimitCount = events.filter(e => 
      e.type === 'REQUEST' && e.data.ip === ip
    ).length;

    const authFailures = events.filter(e => 
      e.type === 'AUTH_FAILURE' && e.data.ip === ip
    ).length;

    return {
      rateLimitCount,
      authFailures,
      isBlocked: authFailures >= 5,
      source: 'REPLAY'
    };
  },

  /**
   * Logical Edge Router Simulation
   */
  getRegion(req: any) {
    return req.headers["x-region"] || "eu-west-simulated";
  }
};

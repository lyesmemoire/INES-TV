import { EventLogService } from "../services/eventLog.service";
import { Region } from "./edge-router";

/**
 * Enterprise Edge State Builder (Level 6 Mesh)
 * Region-Aware Stateless Compute
 */
export const EdgeState = {
  /**
   * Rebuilds security context for a SPECIFIC regional node
   */
  async getSecurityState(ip: string, region: Region) {
    // ⚡ FAST PATH: Read from Regional Snapshot
    const snapshot = await EventLogService.getRegionSnapshot(region);
    const now = Date.now();
    
    if (snapshot && (now - snapshot.updatedAt < 30000)) {
      const ipState = snapshot.security?.[ip] || { rateLimitCount: 0, authFailures: 0 };
      return {
        ...ipState,
        isBlocked: ipState.authFailures >= 5,
        region,
        source: 'REGIONAL_SNAPSHOT'
      };
    }

    // 🔄 FALLBACK: Replay current regional segment
    const events = await EventLogService.replayRegionSegment(region);
    
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
      region,
      source: 'REGIONAL_REPLAY'
    };
  }
};

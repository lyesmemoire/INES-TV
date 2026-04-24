import { EventLogService } from "../services/eventLog.service";

/**
 * Enterprise Edge State Builder
 * Reconstructs ephemeral state from history on-demand.
 * Inspired by Cloudflare Workers / Vercel Edge.
 */
export const EdgeState = {
  /**
   * Rebuilds the security context (Rate limits, brute-force counters)
   */
  async getSecurityState(ip: string) {
    const events = await EventLogService.replayRecent(10); // 10 min window
    
    const rateLimitCount = events.filter(e => 
      e.type === 'REQUEST' && 
      e.data.ip === ip
    ).length;

    const authFailures = events.filter(e => 
      e.type === 'AUTH_FAILURE' && 
      e.data.ip === ip
    ).length;

    return {
      rateLimitCount,
      authFailures,
      isBlocked: authFailures >= 5
    };
  },

  /**
   * Rebuilds runtime metrics from the event log
   */
  async getRuntimeMetrics(minutes = 5) {
    const events = await EventLogService.replayRecent(minutes);
    
    const requests = events.filter(e => e.type === 'REQUEST').length;
    const errors = events.filter(e => e.type === 'ERROR').length;
    
    return {
      requests,
      errors,
      errorRate: requests > 0 ? (errors / requests) : 0,
      timestamp: Date.now()
    };
  }
};

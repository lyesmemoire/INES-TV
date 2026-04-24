import { EPGProgram, EPGCell } from "../types/epg";
import { timeToPosition, MINUTE_WIDTH } from "./timeWindow";

/**
 * 📊 LAYOUT CALCULATOR (TiviMate Grade)
 * Pure, high-performance geometric mapper for EPG rows.
 * Computes cell positions and live statuses in a single pass.
 */
export const buildCells = (programs: EPGProgram[], windowStart: Date): EPGCell[] => {
  const now = Date.now();
  
  return programs.map((p) => {
    const start = new Date(p.start_time);
    const end = new Date(p.end_time);

    const left = timeToPosition(start, windowStart);
    const width = ((end.getTime() - start.getTime()) / 60000) * MINUTE_WIDTH;

    // 🔴 Live Logic
    const isLive = now >= start.getTime() && now <= end.getTime();
    
    // Status Logic (Logical richness for filtering/UI)
    let status: EPGCell["status"] = "future";
    if (now > end.getTime()) status = "past";
    else if (isLive) status = "live";

    return {
      program: p,
      left,
      width,
      isLive,
      status,
    };
  });
};

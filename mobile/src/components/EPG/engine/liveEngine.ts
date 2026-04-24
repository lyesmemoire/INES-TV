/**
 * 🛰️ EPG LIVE ENGINE
 * Handles server-time offsets and live program detection.
 */

import { UIProgram } from './alignment';

/**
 * Corrects program times based on server offset (minutes).
 */
export function applyTimeOffset(programs: UIProgram[], offsetMinutes: number): UIProgram[] {
  if (offsetMinutes === 0) return programs;

  return programs.map(p => ({
    ...p,
    start_time: new Date(new Date(p.start_time).getTime() + offsetMinutes * 60000),
    end_time: new Date(new Date(p.end_time).getTime() + offsetMinutes * 60000),
  }));
}

/**
 * Finds the currently active program from a list.
 */
export function getLiveProgram(programs: UIProgram[], now: Date = new Date()): UIProgram | null {
  return programs.find(p => {
    const start = new Date(p.start_time);
    const end = new Date(p.end_time);
    return now >= start && now <= end;
  }) || null;
}

/**
 * Calculates current playback progress (0 to 1).
 */
export function getProgramProgress(program: UIProgram, now: Date = new Date()): number {
  const start = new Date(program.start_time).getTime();
  const end = new Date(program.end_time).getTime();
  const current = now.getTime();

  if (current <= start) return 0;
  if (current >= end) return 1;

  return (current - start) / (end - start);
}

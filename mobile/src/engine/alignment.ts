import { EPGProgram } from "../types/epg";

/**
 * 📐 ALIGNMENT ENGINE (Staff Level)
 * Handles IPTV data normalization and Gap-Filling.
 * Optimization: Stable sorting to avoid ID flip-flops.
 */
export function normalizePrograms(programs: EPGProgram[]): EPGProgram[] {
  return [...programs]
    .map((p) => ({
      ...p,
      start_time: new Date(p.start_time).toISOString(),
      end_time: new Date(p.end_time).toISOString(),
    }))
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() -
        new Date(b.start_time).getTime()
    );
}

/**
 * 🧱 GAP FILLING ENGINE
 * Essential for IPTV stability. 
 * Detects missing intervals and injects "No Information" placeholders.
 */
export function fillGaps(programs: EPGProgram[]): EPGProgram[] {
  if (programs.length === 0) return [];
  
  const result: EPGProgram[] = [];

  for (let i = 0; i < programs.length; i++) {
    const current = programs[i];
    const next = programs[i + 1];

    result.push(current);

    if (next) {
      const currentEnd = new Date(current.end_time).getTime();
      const nextStart = new Date(next.start_time).getTime();
      const gap = nextStart - currentEnd;

      // Only fill gaps larger than 2 minutes to avoid tiny noise cells
      if (gap > 120000) {
        result.push({
          id: `gap-${current.id}-${next.id}`,
          channel_id: current.channel_id,
          title: "Pas d'information",
          start_time: current.end_time,
          end_time: next.start_time,
          is_filler: true,
        });
      }
    }
  }

  return result;
}

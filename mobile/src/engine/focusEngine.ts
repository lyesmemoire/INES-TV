import { EPGProgram, EPGCell } from "../types/epg";

/**
 * 🎯 ROBUST SNAP ENGINE (TiviMate Class)
 * Calculates the perfect horizontal jump time by aligning with actual program boundaries.
 */
export const snapToProgram = (targetTime: number, programs: any[]) => {
  if (!programs?.length) return targetTime;

  let closest = programs[0];

  for (const p of programs) {
    const start = new Date(p.start_time).getTime();
    const end = new Date(p.end_time).getTime();

    // 🎯 If target is inside a program, return the start of that program
    if (targetTime >= start && targetTime <= end) {
      return start;
    }

    // 🔍 Find the closest boundary as fallback
    if (
      Math.abs(start - targetTime) <
      Math.abs(new Date(closest.start_time).getTime() - targetTime)
    ) {
      closest = p;
    }
  }

  return new Date(closest.start_time).getTime();
};

/**
 * ⚓ SCROLL ANCHOR ENGINE
 * Calculates the new scrollX offset to ensure the focused cell remains in the viewport.
 */
/**
 * ⚓ SMART SCROLL ANCHORING (TiviMate Level)
 * Ensures the focused element remains visible and centered.
 */
export const ensureVisibleX = (x: number, viewportWidth: number, currentScrollX: number) => {
  if (x < currentScrollX + 100) return Math.max(0, x - 100);
  if (x > currentScrollX + viewportWidth - 300) return x - viewportWidth / 2;
  return null;
};

export const ensureVisibleY = (y: number, viewportHeight: number, currentScrollY: number) => {
  if (y < currentScrollY + 80) return Math.max(0, y - 80);
  if (y > currentScrollY + viewportHeight - 120) return y - viewportHeight / 2;
  return null;
};
let lastMove = 0;

/**
 * ⚡ ANTI-LAG REMOTE THROTTLE
 * Prevents remote event spam while maintaining responsiveness.
 */
export function throttleRemote(fn: (evt: any) => void) {
  return (evt: any) => {
    const now = Date.now();

    // 120ms is the "sweet spot" for TV D-pad repetition safety
    if (now - lastMove < 120) return;

    lastMove = now;
    fn(evt);
  };
}

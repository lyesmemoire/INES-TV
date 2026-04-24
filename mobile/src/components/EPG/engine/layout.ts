/**
 * 📐 EPG LAYOUT CALCULATOR
 * Transforms time into pixel dimensions for the grid.
 */

export const LAYOUT_CONFIG = {
  PIXELS_PER_MINUTE: 3,
  ROW_HEIGHT: 60,
  CHANNEL_COL_WIDTH: 100,
  MIN_CELL_WIDTH: 40,
  MAX_CELL_WIDTH: 1200,
};

/**
 * Calculates the width in pixels for a given duration.
 */
export function getWidthFromDuration(start: Date, end: Date): number {
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;
  const rawWidth = durationMinutes * LAYOUT_CONFIG.PIXELS_PER_MINUTE;
  
  // Clamp for UI stability
  return Math.min(Math.max(rawWidth, LAYOUT_CONFIG.MIN_CELL_WIDTH), LAYOUT_CONFIG.MAX_CELL_WIDTH);
}

/**
 * Calculates the horizontal offset from the window start.
 */
export function getOffsetFromStart(windowStart: Date, programStart: Date): number {
  const diffMinutes = (programStart.getTime() - windowStart.getTime()) / 60000;
  return diffMinutes * LAYOUT_CONFIG.PIXELS_PER_MINUTE;
}

/**
 * 🕒 TIME WINDOW ENGINE (TiviMate Grade)
 * Centralized logic for horizontal grid mapping.
 */
export const MINUTE_WIDTH = 3; // Horizontal density optimized for 60fps

export const getTimeWindow = (nowMs: number = Date.now()) => {
  const start = new Date(nowMs - 2 * 60 * 60 * 1000); // 2h in the past
  const end = new Date(nowMs + 6 * 60 * 60 * 1000);   // 6h in the future

  return { start, end };
};

/**
 * 📏 TIME TO POSITION
 * Translates a given time to a pixel offset relative to the window start.
 */
export const timeToPosition = (time: Date, windowStart: Date) => {
  const diffMinutes = (time.getTime() - windowStart.getTime()) / 60000;
  return diffMinutes * MINUTE_WIDTH;
};

/**
 * ⏱️ EPG TIME WINDOW ENGINE
 * Manages the sliding window for EPG display.
 */

export const WINDOW_CONFIG = {
  PAST_HOURS: 2,
  FUTURE_HOURS: 6,
  STEP_MINUTES: 30,
};

export function getEPGTimeWindow() {
  const now = new Date();
  
  const startTime = new Date(now.getTime() - WINDOW_CONFIG.PAST_HOURS * 3600000);
  const endTime = new Date(now.getTime() + WINDOW_CONFIG.FUTURE_HOURS * 3600000);
  
  // Normalize to 30min slots for consistent grid start
  startTime.setMinutes(startTime.getMinutes() < 30 ? 0 : 30, 0, 0);
  
  return {
    start: startTime,
    end: endTime,
    now: now
  };
}

export function getTimeSlots(start: Date, end: Date) {
  const slots: Date[] = [];
  let current = new Date(start);
  
  while (current < end) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + WINDOW_CONFIG.STEP_MINUTES * 60000);
  }
  
  return slots;
}

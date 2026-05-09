/**
 * 🍿 INES TV POP MANAGER
 * Manages frequency capping for pop-under ads.
 */

const POP_KEY = 'itv_pop_last_shown';
const POP_COOLDOWN_HOURS = 24;

export const shouldShowPop = (): boolean => {
  if (typeof window === 'undefined') return false;

  const lastShown = localStorage.getItem(POP_KEY);

  if (!lastShown) return true;

  try {
    const lastTimestamp = parseInt(lastShown, 10);
    const hoursSinceLast = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
    return hoursSinceLast >= POP_COOLDOWN_HOURS;
  } catch (err) {
    // If corruption, reset
    localStorage.removeItem(POP_KEY);
    return true;
  }
};

export const markPopAsShown = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(POP_KEY, Date.now().toString());
  }
};

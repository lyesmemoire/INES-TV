/**
 * 📓 SIMPLE MOBILE LOGGER (Phase 50)
 * Provides a standardized logging interface for the React Native app.
 */
const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${msg}`, data || "");
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[WARN] ${msg}`, data || "");
  },
  error: (msg: string, data?: any) => {
    console.error(`[ERROR] ${msg}`, data || "");
  }
};

export default logger;

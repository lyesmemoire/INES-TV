/**
 * 🗺️ HEATMAP TRACKER
 * Logs user click positions to optimize ad placement.
 */

export const logClickPosition = (x: number, y: number) => {
  if (typeof window === 'undefined' || !navigator.sendBeacon) return;

  const data = {
    x,
    y,
    width: window.innerWidth,
    height: window.innerHeight,
    timestamp: Date.now(),
    page: window.location.pathname,
    device: /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  };

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  navigator.sendBeacon('/api/heatmap', blob);
};

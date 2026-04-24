import { useState, useCallback } from "react";

/**
 * Hook to manage EPG scaling (pixels per minute)
 * @param initialScale Starting scale (default 3px/min)
 * @returns scale, zoomIn, zoomOut
 */
export function useZoom(initialScale: number = 3) {
  const [scale, setScale] = useState(initialScale);

  // Zoom Levels:
  // 1: 1px per minute (60px per hour)
  // 3: 3px per minute (180px per hour) - Good default
  // 10: 10px per minute (600px per hour) - Maximum zoom

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 1, 10));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 1, 1));
  }, []);

  return { scale, zoomIn, zoomOut };
}

'use client';

import { logClickPosition } from '@/lib/ads/heatmap';

/**
 * 🕵️ HEATMAP TRACKER COMPONENT
 * Wraps content to capture and log click coordinates.
 */
export const HeatmapTracker = ({ children }: { children: React.ReactNode }) => {
  const handleClick = (e: React.MouseEvent) => {
    logClickPosition(e.clientX, e.clientY);
  };

  return (
    <div 
      onClick={handleClick} 
      style={{ minHeight: '100%', width: '100%' }}
      className="heatmap-wrapper"
    >
      {children}
    </div>
  );
};

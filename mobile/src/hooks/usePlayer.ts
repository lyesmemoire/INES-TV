import { useState, useEffect } from "react";

/**
 * Hook for TV Channel Zapping Logic
 * Manages the current channel index and provides next/prev navigation.
 */
export function usePlayer(channels: any[], currentId: string) {
  const [index, setIndex] = useState(0);

  // Sync index with the ID from the route (usually initial load)
  useEffect(() => {
    const i = channels.findIndex((c) => c.id === currentId);
    if (i !== -1) setIndex(i);
  }, [currentId, channels]);

  const next = () => {
    setIndex((prev) => {
      if (prev < channels.length - 1) return prev + 1;
      return 0; // Loop to first channel for PRO experience
    });
  };

  const prev = () => {
    setIndex((prev) => {
      if (prev > 0) return prev - 1;
      return channels.length - 1; // Loop to last channel
    });
  };

  return {
    channel: channels[index],
    next,
    prev,
    index,
  };
}

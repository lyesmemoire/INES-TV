import { useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Channel } from '../types';

/**
 * ⚙️ PRIORITIZATION ENGINE (Staff Level)
 * Smart logic to partition channels into Favorites, Recents and the rest.
 * Ensures zero duplication and 100% local calculation for maximum fluidity.
 */
export const usePrioritizedChannels = (channels: Channel[]) => {
  const { favorites, recents } = useUserStore();

  return useMemo(() => {
    if (!channels || channels.length === 0) {
      return { favorites: [], recents: [], all: [] };
    }

    const favoriteSet = new Set(favorites);
    const recentIds = recents.map((r) => r.channelId);

    // 1. Core Favorites (Top priority)
    const favoritesList = channels.filter((c) =>
      favoriteSet.has(c.id)
    );

    // 2. Recents (Engagement layer) - Exclude if already in Favorites
    const recentsList = channels.filter(
      (c) =>
        recentIds.includes(c.id) &&
        !favoriteSet.has(c.id)
    );

    // 3. The Rest (Standard guide)
    const allChannels = channels.filter(
      (c) =>
        !favoriteSet.has(c.id) &&
        !recentIds.includes(c.id)
    );

    return {
      favorites: favoritesList,
      recents: recentsList,
      all: allChannels,
    };
  }, [channels, favorites, recents]);
};

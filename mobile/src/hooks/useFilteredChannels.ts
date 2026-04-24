import { useMemo } from 'react';
import { Channel } from '../types';

/**
 * ⚡ FILTER ENGINE (Zero Cost)
 * Dynamically filters the channel list based on the selected sidebar category.
 * Logic is 100% local for sub-millisecond switching.
 */
export const useFilteredChannels = (
  channels: Channel[],
  selectedCategory: string,
  favorites: string[]
) => {
  return useMemo(() => {
    if (!channels) return [];
    
    // 🌍 CASE: All channels
    if (selectedCategory === 'ALL') return channels;

    // ⭐ CASE: User Favorites
    if (selectedCategory === 'FAVORITES') {
        const favSet = new Set(favorites);
        return channels.filter((c) => favSet.has(c.id));
    }

    // 📺 CASE: Generic Category Filter
    return channels.filter(
      (c) => c.category?.toUpperCase() === selectedCategory.toUpperCase()
    );
  }, [channels, selectedCategory, favorites]);
};

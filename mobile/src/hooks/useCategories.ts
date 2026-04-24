import { useMemo } from 'react';
import { Channel } from '../types';

/**
 * ⚙️ CATEGORY EXTRACTOR (Zero Bandwidth)
 * Automatically derives unique categories from the loaded channel list.
 * Adds virtual categories for "ALL" and "FAVORITES" to match TiviMate UX.
 */
export const useCategories = (channels: Channel[]) => {
  return useMemo(() => {
    if (!channels || channels.length === 0) return ['ALL', 'FAVORITES'];

    const categorySet = new Set<string>();

    channels.forEach((c) => {
      // Logic: Prioritize .category field
      if (c.category) categorySet.add(c.category.toUpperCase());
    });

    // 🏗️ Final Category List with UX prioritization
    const categories = [
      'ALL',
      'FAVORITES',
      ...Array.from(categorySet).sort(),
    ];

    return categories;
  }, [channels]);
};

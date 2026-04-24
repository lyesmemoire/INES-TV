import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  favorites: string[];
  recents: { channelId: string; timestamp: number }[];

  // Actions
  toggleFavorite: (channelId: string) => void;
  addRecent: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
};

/**
 * 🛰️ GLOBAL USER STORE (Staff Level)
 * Local-First retention engine with AsyncStorage persistence.
 * Zero Bandwidth strategy: user preferences are kept locally.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recents: [],

      toggleFavorite: (channelId) => {
        const { favorites } = get();
        const exists = favorites.includes(channelId);

        set({
          favorites: exists
            ? favorites.filter((id) => id !== channelId)
            : [channelId, ...favorites],
        });
      },

      addRecent: (channelId) => {
        const now = Date.now();
        const { recents } = get();

        // 🧠 Logic: Clean duplicates and keep top 10
        const filtered = recents.filter((r) => r.channelId !== channelId);

        const updated = [
          { channelId, timestamp: now },
          ...filtered,
        ].slice(0, 10);

        set({ recents: updated });
      },

      isFavorite: (channelId) => {
        return get().favorites.includes(channelId);
      },
    }),
    {
      name: 'user-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

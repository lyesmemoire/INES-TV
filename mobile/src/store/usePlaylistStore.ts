import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface Playlist {
  id: string;
  name: string;
  type: string;
  status: string;
  lastFetched: string | null;
}

interface PlaylistState {
  playlists: Playlist[];
  selectedPlaylistId: string | null; // null = ALL
  isLoading: boolean;

  fetchPlaylists: (userId: string) => Promise<void>;
  setSelectedPlaylist: (id: string | null) => void;
  addPlaylist: (userId: string, data: any) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
}

/**
 * 🛰️ GLOBAL PLAYLIST STORE (Aggregator Logic)
 * Manages M3U/XTREAM sources and source-aware filtering.
 */
export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  selectedPlaylistId: null,
  isLoading: false,

  fetchPlaylists: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ playlists: data || [] });
    } catch (err) {
      console.error('[PlaylistStore] Fetch failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedPlaylist: (id: string | null) => set({ selectedPlaylistId: id }),

  addPlaylist: async (userId: string, data: any) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('playlists')
        .insert([{ ...data, user_id: userId }]);

      if (error) throw error;
      await get().fetchPlaylists(userId);
    } catch (err) {
      console.error('[PlaylistStore] Add failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlaylist: async (id: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ playlists: get().playlists.filter(p => p.id !== id) });
    } catch (err) {
      console.error('[PlaylistStore] Delete failed:', err);
    }
  },
}));

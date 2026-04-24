import { create } from 'zustand';
import { EPGProgram, EPGCell } from '../types/epg';

interface EPGCache {
  programs: Record<string, EPGProgram[]>; // channelId -> aligned programs
  cells: Record<string, EPGCell[]>;       // channelId -> calculated layout cells
  lastUpdate: number;                    // timestamp of last calculation
}

interface EPGState {
  cache: EPGCache;
  selectedChannelId: string | null;
  livePointer: number; // logic time (15s tick)
  uiTick: number;      // visual time (1s tick)
  
  // Actions
  updateCache: (channelId: string, programs: EPGProgram[], hexLayout: EPGCell[]) => void;
  setLivePointer: (time: number) => void;
  setUITick: (time: number) => void;
  setSelectedChannel: (id: string | null) => void;
  clearCache: () => void;
}

/**
 * 🛰️ EPG STATE LAYER (Staff Level)
 * Centralized store with Derived State Cache to prevent CPU spikes.
 * Holds pre-calculated layout to guarantee 60fps row re-renders.
 */
export const useEPGStore = create<EPGState>((set) => ({
  cache: {
    programs: {},
    cells: {},
    lastUpdate: 0,
  },
  selectedChannelId: null,
  livePointer: Date.now(),
  uiTick: Date.now(),

  updateCache: (channelId, programs, cells) => set((state) => ({
    cache: {
      ...state.cache,
      programs: { ...state.cache.programs, [channelId]: programs },
      cells: { ...state.cache.cells, [channelId]: cells },
      lastUpdate: Date.now(),
    }
  })),

  setLivePointer: (time) => set({ livePointer: time }),
  setUITick: (time) => set({ uiTick: time }),

  setSelectedChannel: (id) => set({ selectedChannelId: id }),

  clearCache: () => set({
    cache: { programs: {}, cells: {}, lastUpdate: 0 }
  }),
}));

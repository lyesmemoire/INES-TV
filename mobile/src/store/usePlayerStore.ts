import { create } from 'zustand';

interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string | null;
  group: string | null;
}

interface PlayerState {
  channels: Channel[];
  currentIndex: number;
  currentChannel: Channel | null;
  showOverlay: boolean;
  
  setChannels: (channels: Channel[]) => void;
  nextChannel: () => void;
  prevChannel: () => void;
  toggleOverlay: () => void;
  setChannelIndex: (index: number) => void;
}

/**
 * 🛰️ GLOBAL IPTV SaaS STORE (Zapping Engine)
 * Handles instant navigation and overlay states.
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  channels: [],
  currentIndex: 0,
  currentChannel: null,
  showOverlay: true,

  setChannels: (channels: Channel[]) =>
    set({
      channels,
      currentChannel: channels[0],
      currentIndex: 0,
    }),

  setChannelIndex: (index: number) => {
    const { channels } = get();
    set({
      currentIndex: index,
      currentChannel: channels[index],
      showOverlay: true,
    });
  },

  nextChannel: () => {
    const { channels, currentIndex } = get();
    if (channels.length === 0) return;
    const nextIndex = (currentIndex + 1) % channels.length;

    set({
      currentIndex: nextIndex,
      currentChannel: channels[nextIndex],
      showOverlay: true,
    });
  },

  prevChannel: () => {
    const { channels, currentIndex } = get();
    if (channels.length === 0) return;
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;

    set({
      currentIndex: prevIndex,
      currentChannel: channels[prevIndex],
      showOverlay: true,
    });
  },

  toggleOverlay: () =>
    set((state) => ({ showOverlay: !state.showOverlay })),
}));

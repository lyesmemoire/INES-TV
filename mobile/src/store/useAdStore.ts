import { create } from 'zustand';

interface AdState {
  lastAdTime: number; // Timestamp of last ad shown
  zapCountSinceLastAd: number;
  isAdPlaying: boolean;
  
  shouldShowAd: () => boolean;
  markAdShown: () => void;
  incrementZapCount: () => void;
}

/**
 * 🔒 AD FATIGUE CONTROLLER (UX Integrity)
 * Prevents over-advertising by enforcing time and zap thresholds.
 */
export const useAdStore = create<AdState>((set, get) => ({
  lastAdTime: 0,
  zapCountSinceLastAd: 0,
  isAdPlaying: false,

  shouldShowAd: () => {
    const { lastAdTime, zapCountSinceLastAd } = get();
    const now = Date.now();
    
    // 🔥 RULES:
    // 1. Min 10 minutes between ads OR
    // 2. Min 5 zaps since last ad
    const timeSinceLastAd = (now - lastAdTime) / 1000 / 60;
    
    return timeSinceLastAd >= 10 || zapCountSinceLastAd >= 5;
  },

  markAdShown: () => {
    set({ 
      lastAdTime: Date.now(), 
      zapCountSinceLastAd: 0,
      isAdPlaying: false 
    });
  },

  incrementZapCount: () => {
    set((state) => ({ zapCountSinceLastAd: state.zapCountSinceLastAd + 1 }));
  }
}));

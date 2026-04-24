import { create } from 'zustand';

interface EPGFocusState {
  // Grid Focus
  focusedChannelIndex: number;
  focusedChannelId: string | null;
  focusedTime: number; 
  scrollX: number;
  scrollY: number;

  // Sidebar Focus (SaaS Categories)
  isSidebarFocused: boolean;
  selectedCategory: string;
  focusedCategoryIndex: number;

  // Actions
  setFocus: (data: Partial<EPGFocusState>) => void;
  setSidebar: (value: boolean) => void;
  setCategory: (category: string, index: number) => void;
  resetFocus: () => void;
}

/**
 * 🎯 EPG FOCUS STORE (TiviMate Level)
 * Global memory for TV navigation, categories and scroll anchoring.
 */
export const useEPGFocusStore = create<EPGFocusState>((set) => ({
  focusedChannelIndex: 0,
  focusedChannelId: null,
  focusedTime: Date.now(),
  scrollX: 0,
  scrollY: 0,

  isSidebarFocused: false,
  selectedCategory: 'ALL',
  focusedCategoryIndex: 0,

  setFocus: (data) => set((state) => ({ ...state, ...data })),

  setSidebar: (value) => set({ isSidebarFocused: value }),

  setCategory: (category, index) =>
    set({ selectedCategory: category, focusedCategoryIndex: index }),

  resetFocus: () => set({
    focusedChannelIndex: 0,
    focusedChannelId: null,
    focusedTime: Date.now(),
    scrollX: 0,
    scrollY: 0,
    isSidebarFocused: false,
    selectedCategory: 'ALL',
    focusedCategoryIndex: 0,
  }),
}));

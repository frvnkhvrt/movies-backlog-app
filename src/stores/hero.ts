import { type Show } from '@/types';
import { create } from 'zustand';

interface HeroState {
  currentShow: Show | null;
}

interface HeroActions {
  setCurrentShow: (show: Show | null) => void;
}

export const useHeroStore = create<HeroState & HeroActions>((set) => ({
  currentShow: null,
  setCurrentShow: (show) => set({ currentShow: show }),
}));
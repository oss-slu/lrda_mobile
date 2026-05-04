import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_ACCENT = "#7FADE1";

export const ACCENT_PALETTE = [
  { id: 1, color: "rgb(196,115,115)" },
  { id: 2, color: "rgb(82,214,168)" },
  { id: 3, color: "rgb(195,142,132)" },
  { id: 4, color: "rgb(96, 113, 209)" },
  { id: 5, color: "rgb(127, 173, 225)" },
  { id: 6, color: "rgb(195,142,232)" },
];

interface ThemeStore {
  accentColor: string;
  isDarkmode: boolean;
  setAccentColor: (color: string) => void;
  toggleDarkmode: () => void;
  reset: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      accentColor: DEFAULT_ACCENT,
      isDarkmode: false,
      setAccentColor: (color) => set({ accentColor: color }),
      toggleDarkmode: () => set((s) => ({ isDarkmode: !s.isDarkmode })),
      reset: () => set({ accentColor: DEFAULT_ACCENT, isDarkmode: false }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

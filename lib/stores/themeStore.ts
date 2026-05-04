import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_ACCENT = "#7FADE1";

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

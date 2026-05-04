import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_THEME = "#7FADE1";

interface ThemeStore {
  theme: string;
  setTheme: (color: string) => void;
  clearTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (color) => set({ theme: color }),
      clearTheme: () => set({ theme: DEFAULT_THEME }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

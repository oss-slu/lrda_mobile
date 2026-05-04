import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "../utils/async_storage";
import { colors } from "./colors";
import { useThemeStore } from "../stores/themeStore";

export type ThemeColors = (typeof colors)["lightColors"];

interface ThemeContextValue {
  isDarkmode: boolean;
  toggleDarkmode: () => void;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const appThemeColor = useThemeStore((state) => state.theme);

  const [isDarkmode, setIsDarkmode] = useState(false);
  colors.darkColors.homeColor = appThemeColor;
  colors.lightColors.homeColor = appThemeColor;

  const toggleDarkmode = () => {
    setIsDarkmode((prevMode) => !prevMode);
    AsyncStorage.save("themePreference", !isDarkmode ? "dark" : "light");
  };

  useEffect(() => {
    AsyncStorage.get<string>("themePreference")
      .then((theme) => {
        setIsDarkmode(theme === "dark");
      })
      .catch((error: unknown) => {
        console.error("Error loading theme preference:", error);
      });
  }, []);

  const theme = isDarkmode ? colors.darkColors : colors.lightColors;

  return <ThemeContext.Provider value={{ isDarkmode, toggleDarkmode, theme }}>{children}</ThemeContext.Provider>;
}

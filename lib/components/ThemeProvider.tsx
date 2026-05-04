import React, { useEffect } from "react";
import { View } from "react-native";
import { vars, useColorScheme } from "nativewind";
import { useThemeStore } from "../stores/themeStore";
import { colors } from "./colors";

export type ThemeColors = (typeof colors)["lightColors"];

export function useTheme() {
  const isDarkmode = useThemeStore((s) => s.isDarkmode);
  const toggleDarkmode = useThemeStore((s) => s.toggleDarkmode);
  const accentColor = useThemeStore((s) => s.accentColor);
  const theme: ThemeColors = isDarkmode ? { ...colors.darkColors, homeColor: accentColor } : { ...colors.lightColors, homeColor: accentColor };
  return { isDarkmode, toggleDarkmode, accentColor, theme };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkmode = useThemeStore((s) => s.isDarkmode);
  const accentColor = useThemeStore((s) => s.accentColor);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(isDarkmode ? "dark" : "light");
  }, [isDarkmode]);

  return (
    <View style={[{ flex: 1 }, vars({ "--color-accent": accentColor })]} className={isDarkmode ? "dark" : ""}>
      {children}
    </View>
  );
}

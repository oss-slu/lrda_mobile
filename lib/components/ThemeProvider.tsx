import React, { useEffect } from "react";
import { View } from "react-native";
import { vars, useColorScheme } from "nativewind";
import { useThemeStore } from "../stores/themeStore";

const COLORS = {
  light: { primary: "#F5F9FE", foreground: "#161A1D" },
  dark: { primary: "#161A1D", foreground: "#F7F8F9" },
} as const;

export function useTheme() {
  const isDarkmode = useThemeStore((s) => s.isDarkmode);
  const toggleDarkmode = useThemeStore((s) => s.toggleDarkmode);
  const accentColor = useThemeStore((s) => s.accentColor);
  const colors = isDarkmode ? COLORS.dark : COLORS.light;
  return { isDarkmode, toggleDarkmode, accentColor, colors };
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

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../components/ThemeProvider";
import { appTheme } from "../components/colors";
import { useThemeStore } from "../stores/themeStore";

function AppThemeSelectorScreen() {
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const { theme } = useTheme();

  return (
    <View className="h-full bg-white px-5 py-[10px]">
      <Text className="mb-[10px] font-inter text-lg font-semibold text-green-500">Current Theme</Text>

      <View
        className="mx-[10px] mt-5 rounded-full border-[0.5px]"
        style={{
          backgroundColor: theme.homeColor,
          height: 40,
          width: 80,
        }}
      />

      <View className="mb-5 flex-row flex-wrap">
        {appTheme.map((theme, key) => (
          <TouchableOpacity
            key={key}
            onPress={() => {
              setAccentColor(theme.themeColor);
            }}
          >
            <View
              className="mx-[10px] mt-5 h-[60px] w-[60px] rounded-full border-[0.5px]"
              style={{ backgroundColor: theme.themeColor }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default AppThemeSelectorScreen;

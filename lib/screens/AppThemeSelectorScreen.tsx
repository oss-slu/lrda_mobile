import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../components/ThemeProvider";
import { ACCENT_PALETTE, useThemeStore } from "../stores/themeStore";

function AppThemeSelectorScreen() {
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const { accentColor } = useTheme();

  return (
    <View className="h-full bg-white px-5 py-[10px]">
      <Text className="mb-[10px] font-inter text-lg font-semibold text-green-500">Current Theme</Text>

      <View
        className="mx-[10px] mt-5 rounded-full border-[0.5px]"
        style={{
          backgroundColor: accentColor,
          height: 40,
          width: 80,
        }}
      />

      <View className="mb-5 flex-row flex-wrap">
        {ACCENT_PALETTE.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setAccentColor(item.color);
            }}
          >
            <View
              className="mx-[10px] mt-5 h-[60px] w-[60px] rounded-full border-[0.5px]"
              style={{ backgroundColor: item.color }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default AppThemeSelectorScreen;

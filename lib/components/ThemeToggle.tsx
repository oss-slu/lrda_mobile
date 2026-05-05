import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ThemeToggleProps {
  isDarkmode: boolean;
  toggleDarkmode: () => void;
  testID?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkmode, toggleDarkmode, testID }) => {
  return (
    <View className="flex-row items-center rounded-lg bg-[#e0e0e0] p-1">
      <TouchableOpacity
        className="rounded-lg px-5 py-2"
        style={{ backgroundColor: isDarkmode ? "transparent" : "#000" }}
        onPress={toggleDarkmode}
        testID={testID}
      >
        <Text className="font-inter text-[10px] font-bold" style={{ color: isDarkmode ? "#000" : "#fff" }}>
          Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="rounded-lg px-5 py-2"
        style={{ backgroundColor: isDarkmode ? "#000" : "transparent" }}
        onPress={toggleDarkmode}
        testID={"${testID}-dark"}
      >
        <Text className="font-inter text-[10px] font-bold" style={{ color: isDarkmode ? "#fff" : "#000" }}>
          Dark
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ThemeToggle;

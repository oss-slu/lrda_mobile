import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ThemeToggleProps {
  isDarkmode: boolean;
  toggleDarkmode: () => void;
  testID?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkmode, toggleDarkmode, testID }) => {
  return (
    <View className="flex-row items-center bg-[#e0e0e0] rounded-lg p-1">
      <TouchableOpacity
        className="py-2 px-5 rounded-lg"
        style={{ backgroundColor: isDarkmode ? "transparent" : "#000" }}
        onPress={toggleDarkmode}
        testID={testID}
      >
        <Text className="font-inter text-[10px] font-bold" style={{ color: isDarkmode ? "#000" : "#fff" }}>
          Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="py-2 px-5 rounded-lg"
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

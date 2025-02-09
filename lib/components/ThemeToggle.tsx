import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ThemeToggleProps {
    isDarkmode: boolean;
    toggleDarkmode: () => void;
    testID?: string; // Optional testID prop for testing
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkmode, toggleDarkmode, testID }) => {
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDarkmode ? "transparent" : "#000" },
        ]}
        onPress={toggleDarkmode}
        testID={testID}
      >
        <Text style={[styles.text, { color: isDarkmode ? "#000" : "#fff" }]}>
          Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDarkmode ? "#000" : "transparent" },
        ]}
        onPress={toggleDarkmode}
        testID={'${testID}-dark'}
      >
        <Text style={[styles.text, { color: isDarkmode ? "#fff" : "#000" }]}>
          Dark
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
});

export default ThemeToggle;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SvgIcon } from "./SvgIcon";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useThemeStore } from "../stores/themeStore";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "expo-router";

function AddNoteBtnComponent() {
  const { navigateToAddNote, publishNote } = useAddNoteContext();
  const { theme, isDarkmode } = useTheme();
  const appThemeColor = useThemeStore((s) => s.theme);
  const toggleAddNoteState = useAddNoteStore((s) => s.toggleAddNoteState);

  const pathname = usePathname();

  const isAddButtonMode = !pathname.includes("/add-note") && !pathname.includes("/edit-note");

  const handleAdd = () => {
    toggleAddNoteState();
    navigateToAddNote();
  };
  const handlePublish = () => publishNote();

  return (
    <View style={styles.container}>
      <SvgIcon style={[styles.background, { width: 60 }]} />
      <TouchableOpacity
        testID="fab-button"
        style={[
          styles.button,
          {
            backgroundColor: theme.primaryColor,
            shadowColor: isDarkmode ? "#fff" : "#000",
          },
        ]}
        onPress={isAddButtonMode ? handleAdd : handlePublish}
      >
        {isAddButtonMode ? (
          <Ionicons name="add" testID="add-icon" size={25} style={[styles.buttonIcon, { color: appThemeColor }]} />
        ) : (
          <Feather name="upload-cloud" testID="publish-icon" size={25} style={[styles.buttonIcon, { color: appThemeColor }]} />
        )}
      </TouchableOpacity>
      <Text style={[styles.label, { color: appThemeColor || "gray" }]}>{isAddButtonMode ? "Add" : "Publish"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 75,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    backgroundColor: "transparent",
    bottom: -35,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  button: {
    backgroundColor: "#f0f0f0",
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    top: -25,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    fontWeight: "800",
    fontSize: 30,
  },
  label: {
    fontSize: 12,
    marginTop: -13,
  },
});

export default AddNoteBtnComponent;

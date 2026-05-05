import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useThemeStore } from "../stores/themeStore";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "expo-router";

function AddNoteBtnComponent() {
  const { navigateToAddNote, publishNote } = useAddNoteContext();
  const { isDarkmode } = useTheme();
  const appThemeColor = useThemeStore((s) => s.accentColor);
  const toggleAddNoteState = useAddNoteStore((s) => s.toggleAddNoteState);

  const pathname = usePathname();

  const isAddButtonMode = !pathname.includes("/add-note") && !pathname.includes("/edit-note");

  const handleAdd = () => {
    toggleAddNoteState();
    navigateToAddNote();
  };
  const handlePublish = () => publishNote();

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        testID="fab-button"
        className="elevation-4 h-[50px] w-[50px] items-center justify-center rounded-full bg-primary shadow-md"
        style={{ shadowColor: isDarkmode ? "#fff" : "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
        onPress={isAddButtonMode ? handleAdd : handlePublish}
      >
        {isAddButtonMode ? (
          <Ionicons name="add" testID="add-icon" size={25} style={{ color: appThemeColor, fontWeight: "800", fontSize: 30 }} />
        ) : (
          <Feather name="upload-cloud" testID="publish-icon" size={25} style={{ color: appThemeColor, fontWeight: "800", fontSize: 30 }} />
        )}
      </TouchableOpacity>
      <Text className="mt-1 text-xs" style={{ color: appThemeColor || "gray" }}>
        {isAddButtonMode ? "Add" : "Publish"}
      </Text>
    </View>
  );
}

export default AddNoteBtnComponent;

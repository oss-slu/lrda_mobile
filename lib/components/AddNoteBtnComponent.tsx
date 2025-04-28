import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";                      // ← merged imports
import { SvgIcon } from "./SvgIcon";
import IonIcons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useSelector, useDispatch } from "react-redux";
import { toogleAddNoteState } from "../../redux/slice/AddNoteStateSlice";
import { useTheme } from "./ThemeProvider";
import { useNavigationState } from "@react-navigation/native";

function AddNoteBtnComponent() {
  const dispatch = useDispatch();
  const { navigateToAddNote, publishNote } = useAddNoteContext();
  const { theme, isDarkmode } = useTheme();
  const appThemeColor = useSelector((s) => s.themeSlice.theme);
  const addNoteState = useSelector((s) => s.addNoteState.isAddNoteOpned);

  // ─── FULL NAVIGATION TREE ───────────────────────────────────────────────
  const navState = useNavigationState((state) => state);
  const tabRoute = navState.routes[navState.index];            // active tab
  const nested   = tabRoute.state;                             // its nested stack
  const currentScreen = nested
    ? nested.routes[nested.index].name                         // e.g. "Home", "AddNote", "EditNote"
    : tabRoute.name;                                           // fallback

  // only on the real Home screen do we force “Add” mode
  const isHomeScreen    = currentScreen === "Home";
  const isAddButtonMode = isHomeScreen || !addNoteState;

  const handleAdd = () => {
    dispatch(toogleAddNoteState());
    navigateToAddNote();
  };
  const handlePublish = () => publishNote();

  return (
    <View style={styles.container}>
      <SvgIcon style={[styles.background, { width: 60 }]} />
      <TouchableOpacity
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
          <IonIcons
            name="add"
            size={25}
            style={[styles.buttonIcon, { color: appThemeColor }]}
          />
        ) : (
          <Feather
            name="upload-cloud"
            size={25}
            style={[styles.buttonIcon, { color: appThemeColor }]}
          />
        )}
      </TouchableOpacity>
      <Text style={[styles.label, { color: appThemeColor || "gray" }]}>
        {isAddButtonMode ? "Add" : "Publish"}
      </Text>
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

import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";
import { useTheme } from "../../lib/components/ThemeProvider";

// build out settings for dark/light mode configuration
// const theme = darkTheme;

const NotePageStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    topContainer: {
      justifyContent: "space-between",
      paddingHorizontal: 5,
      paddingTop: Constants.statusBarHeight,
      flexDirection: "row",
      backgroundColor: theme.primaryColor,
      alignItems: "center",
      textAlign: "center",
    },
    topText: {
      flex: 1,
      maxWidth: "100%",
      fontWeight: "700",
      fontSize: 32,
      textAlign: "center",
      color: theme.text,
    },
    topButtons: {
      backgroundColor: theme.secondaryColor,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99,
    },
    container: {
      backgroundColor: theme.primaryColor,
      overflow: "hidden",
    },
    title: {
      height: 45,
      width: "70%",
      borderColor: theme.secondaryColor,
      borderWidth: 1,
      borderRadius: 30,
      paddingHorizontal: 10,
      textAlign: "center",
      fontSize: 30,
      color: theme.text,
    },
    input: {
      flex: 1,
      borderColor: theme.secondaryColor,
      backgroundColor: theme.primaryColor,
      fontSize: 22,
      color: theme.text,
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: theme.secondaryColor,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    keyContainer: {
      height: 60,
      paddingVertical: 5,
      width: "100%",
      backgroundColor: theme.primaryColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 40,
    },
    saveText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 12,
    },
    video: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignSelf: "center",
    },
  });
};

export default NotePageStyles;

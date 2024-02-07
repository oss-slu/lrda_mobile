import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";
import { useTheme } from "../../lib/components/ThemeProvider";
import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

const NotePageStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    topContainer: {
      minHeight: 140,
    },
    topButtonsContainer: {
      justifyContent: "space-between",
      paddingHorizontal: 5,
      paddingTop: Constants.statusBarHeight,
      flexDirection: "row",
      backgroundColor: theme.primaryColor,
      alignItems: "center",
      textAlign: "center",
    },
    topText: {
      maxWidth: "100%",
      fontWeight: "700",
      fontSize: 32,
      textAlign: "center",
      color: theme.text,
    },
    topButtons: {
      backgroundColor: theme.tertiaryColor,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99,
    },
    container: {
      backgroundColor: theme.tertiaryColor,
      marginBottom: 4,
      width: "100%",
      // overflow: "hidden",
    },
    textEditorContainer: {
      minHeight: 100,
    },
    title: {
      height: 45,
      width: "70%",
      borderColor: theme.text,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 10,
      textAlign: "center",
      fontSize: 30,
      color: theme.text,
    },
    input: {
      backgroundColor: 'white',
      // borderColor: theme.secondaryColor,
      fontSize: 22,
      color: theme.text,
      height: 900, 
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
      backgroundColor: 'black',
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

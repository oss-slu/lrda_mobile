import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";

// build out settings for dark/light mode configuration
const globalStyle = lightTheme;
// const globalStyle = darkTheme;

export const NotePageStyles = StyleSheet.create({
  topContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingTop: Constants.statusBarHeight,
    flexDirection: "row",
    backgroundColor: globalStyle.highlightTertiary,
    alignItems: "center",
    textAlign: "center",
  },
  topText: {
    flex: 1,
    maxWidth: "100%",
    fontWeight: "700",
    fontSize: 32,
    textAlign: "center",
    color: globalStyle.textPrimary,
  },
  topButtons: {
    backgroundColor: globalStyle.backgroundTertiary,
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  container: {
    backgroundColor: globalStyle.backgroundPrimary,
    overflow: "hidden",
  },
  title: {
    height: 45,
    width: "70%",
    borderColor: globalStyle.backgroundTertiary,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    textAlign: "center",
    fontSize: 30,
    color: globalStyle.textPrimary,
  },
  input: {
    flex: 1,
    borderColor: globalStyle.backgroundTertiary,
    fontSize: 22,
    color: globalStyle.textPrimary,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: globalStyle.backgroundTertiary,
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
    backgroundColor: globalStyle.highlightTertiary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  saveText: {
    color: globalStyle.textPrimary,
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

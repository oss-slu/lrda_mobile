import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";
import { Dimensions } from "react-native";
import { defaultTextFont } from "../globalStyles";

// build out settings for dark/light mode configuration
const globalStyle = lightTheme;
// const globalStyle = darkTheme;

export const PhotoStyles = StyleSheet.create({
    container: {
        backgroundColor: globalStyle.backgroundPrimary,
        marginBottom: 10,
        width: "100%",
        justifyContent: "center",
      },
      image: {
        width: 100,
        height: 100,
        borderRadius: 20,
      },
      trash: {
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 20, // Lower than closeUnderlay but above other elements
        height: 25,
        width: 25,
        backgroundColor: "rgba(255,0,0,0.8)",
        borderRadius: 12.5,
        justifyContent: "center",
        alignItems: "center",
      },
      video: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignSelf: "center",
      },
      footerContainer: {
        backgroundColor: "rgba(255,255,255, 0.8)",
        padding: 10,
        alignItems: "center",
        marginBottom: "13%",
        width: "80%",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: 10,
      },
      footerText: {
        ...defaultTextFont,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: globalStyle.textPrimary,
      },
      playUnderlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -25, // Half of height
        marginLeft: -25, // Half of width
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(5,5,5,0.7)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10, // Ensure it's above the image
      },
      closeUnderlay: {
        position: "absolute",
        top: 50,
        right: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(0,0,0,0.7)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100, // Highest z-index for close button
      },
      icon: {
        alignSelf: "center",
        marginLeft: 4,
        color: "#dfe5e8",
      },
      videoContainer: {
        marginVertical: 20,
        width: "100%",
        height: 200, // Fixed height instead of screen height
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: globalStyle.backgroundPrimary,
        borderRadius: 10,
        overflow: "hidden", // Prevent content from overflowing
      },
  });
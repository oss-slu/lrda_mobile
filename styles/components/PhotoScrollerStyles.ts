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
        zIndex: 99,
        height: "15%",
        width: "15%",
        backgroundColor: "rgba(5,5,5,0.75)",
        borderRadius: 30,
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
        marginTop: "60%",
        top: "50%",
        left: "50%",
        transform: [{ translateY: -25 }, { translateX: -25 }],
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: "rgba(5,5,5,0.5)",
        alignItems: "center",
        justifyContent: "center",
      },
      closeUnderlay: {
        position: "absolute",
        top: 50,
        right: 10,
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: "rgba(5,5,5,0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      },
      icon: {
        alignSelf: "center",
        marginLeft: 4,
        color: "#dfe5e8",
      },
      videoContainer: {
        marginVertical: 50,
        width: "100%",
        height: Dimensions.get("screen").height - 70,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        backgroundColor: globalStyle.backgroundPrimary,
      },
  });
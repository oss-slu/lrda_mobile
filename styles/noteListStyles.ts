import { useMemo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Constants from "expo-constants";
import { defaultTextFont } from "./globalStyles";

const { width, height } = Dimensions.get("window");

export function useNoteListStyles(theme: Record<string, string>) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: Constants.statusBarHeight - 20,
          backgroundColor: theme.homeColor,
          height: width > 500 ? height * 0.12 : height * 0.19,
        },
        pfpText: {
          ...defaultTextFont,
          fontWeight: "600",
          fontSize: 14,
          alignSelf: "center",
          color: theme.white,
        },
        userPhoto: {
          height: width * 0.095,
          width: width * 0.095,
          borderRadius: 50,
          alignContent: "center",
          justifyContent: "center",
          backgroundColor: theme.black,
          marginLeft: 8,
        },
        scrollerBackgroundColor: {
          flex: 1,
          width: "100%",
        },
        topView: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 5,
          marginBottom: 0,
          marginTop: 10,
          backgroundColor: theme.homeColor,
        },
        userWishContainer: {
          marginRight: 10,
        },
        userName: {
          ...defaultTextFont,
          fontWeight: "500",
          height: "50%",
          textAlign: "center",
          alignSelf: "center",
        },
        toolContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        },
        searchContainer: {
          right: 0,
          bottom: 0,
          backgroundColor: "#f0f0f0",
          justifyContent: "center",
          alignItems: "center",
          height: 36,
          borderRadius: 25,
          overflow: "hidden",
        },
        searchInput: {
          ...defaultTextFont,
          flex: 1,
          fontSize: 16,
          color: "black",
          paddingHorizontal: 10,
          paddingVertical: 0,
          width: "100%",
        },
        searchIcon: {
          marginBottom: 10,
        },
        searchParentContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        userAccountAndPageTitle: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: width > 500 ? "13%" : "27%",
        },
        pageTitle: {
          ...defaultTextFont,
          fontSize: 18,
          fontWeight: "500",
        },
        lottie: {
          width: 100,
          height: 200,
        },
        resultNotFound: {
          justifyContent: "center",
          alignItems: "center",
        },
        resultNotFoundTxt: {
          ...defaultTextFont,
          fontSize: 15,
          fontWeight: "400",
        },
        selectedSortOption: {
          width: width * 0.4,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
        },
      }),
    [theme],
  );
}

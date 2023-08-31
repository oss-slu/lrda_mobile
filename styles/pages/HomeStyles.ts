import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";

// build out settings for dark/light mode configuration
const globalStyle = lightTheme
// const globalStyle = darkTheme;

export const HomeStyles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight - 20,
    flex: 1,
    backgroundColor: globalStyle.backgroundPrimary,
  },
  pfpText: {
    fontWeight: "600",
    fontSize: 20,
    alignSelf: "center",
    color: globalStyle.textPrimary,
  },
  shareColor: {
    color: globalStyle.highlightSecondary,
  },
  highlightColor: {
    color: globalStyle.border,
  },
  backColor: {
    color: globalStyle.backgroundTertiary,
  },
  userPhoto: {
    height: 50,
    width: 50,
    borderRadius: 50,
    alignContent: "center",
    justifyContent: "center",
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
    flexShrink: 1,
    color: globalStyle.textPrimary,
  },
  noteText: {
    marginTop: 10,
    fontSize: 18,
    color: globalStyle.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  topView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  noteContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: globalStyle.backgroundSecondary,
    borderRadius: 20,
    marginBottom: 10,
    width: "98%",
    padding: 10,
    flexDirection: "row",
    height: 120,
  },
  filtersContainer: {
    minHeight: 30,
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 5,
    maxHeight: 30,
    marginBottom: 17,
    zIndex: 10,
  },
  filters: {
    justifyContent: "center",
    borderColor: globalStyle.border,
    borderWidth: 2,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  filtersSelected: {
    justifyContent: "center",
    backgroundColor: globalStyle.highlightSecondary,
    fontSize: 22,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  selectedFont: {
    fontSize: 17,
    color: globalStyle.textPrimary,
    fontWeight: "700",
  },
  filterFont: {
    fontSize: 16,
    fontWeight: "600",
    color: globalStyle.textPrimary,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    lineHeight: 80,
    color: globalStyle.textPrimary,
    marginLeft: 5,
    marginBottom: "-1%",
  },
  backRightBtn: {
    alignItems: "flex-end",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    paddingRight: 17,
  },
  backRightBtnRight: {
    backgroundColor: globalStyle.highlightPrimary,
    width: "52%",
    right: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: globalStyle.highlightSecondary,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    margin: 5,
    marginBottom: 15,
    borderRadius: 20,
  },
});

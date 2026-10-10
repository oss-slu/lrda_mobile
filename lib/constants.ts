import { Platform } from "react-native";

// Height of the floating tab bar in app/(tabs)/_layout.tsx. Screens inside the
// tab navigator use this to keep interactive content from resting underneath
// the bar, where the transparent center slot lets the Add button steal taps.
export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 70;

// Account deletion lives on the website so the same page serves App Store and
// Play Store requirements for a deletion link.
export const DELETE_ACCOUNT_URL = "https://wheresreligion.org/delete-account";

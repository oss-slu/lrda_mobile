import { Platform } from "react-native";

// Height of the floating tab bar in app/(tabs)/_layout.tsx. Screens inside the
// tab navigator use this to keep interactive content from resting underneath
// the bar, where the transparent center slot lets the Add button steal taps.
export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 70;

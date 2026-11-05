import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "../constants";

// Android draws edge-to-edge, so the tab bar has to grow by the navigation-bar
// height to stay above 3-button nav. iOS's TAB_BAR_HEIGHT already allows for the
// home indicator.
export function useTabBarBottomInset() {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === "android" ? bottom : 0;
}

export function useTabBarHeight() {
  return TAB_BAR_HEIGHT + useTabBarBottomInset();
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useTheme } from "../../lib/components/ThemeProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import AddNoteBtnComponent from "../../lib/components/AddNoteBtnComponent";

export default function TabsLayout() {
  const { theme, isDarkmode } = useTheme();
  const appThemeColor = useSelector((state: RootState) => state.themeSlice.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.primaryColor,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 80 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 20,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          backgroundColor: theme.primaryColor,
          height: "100%",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="home" size={size} color={focused ? (isDarkmode ? "white" : "black") : appThemeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarLabel: "Library",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="library" size={size} color={focused ? (isDarkmode ? "white" : "black") : appThemeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-note-tab"
        options={{
          tabBarLabel: "Add",
          tabBarButton: () => <AddNoteBtnComponent />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="map" size={size} color={focused ? (isDarkmode ? "white" : "black") : appThemeColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarLabel: "More",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="menu-outline" size={size + 10} color={focused ? (isDarkmode ? "white" : "black") : appThemeColor} />
          ),
        }}
      />
    </Tabs>
  );
}

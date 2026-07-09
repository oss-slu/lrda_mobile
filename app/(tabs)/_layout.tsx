import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useTheme } from "../../lib/components/ThemeProvider";
import { TAB_BAR_HEIGHT } from "../../lib/constants";
import AddNoteBtnComponent from "../../lib/components/AddNoteBtnComponent";

export default function TabsLayout() {
  const { colors, isDarkmode, accentColor } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.primary,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === "ios" ? 30 : 20,
          borderTopWidth: 0,
          elevation: 0,
          overflow: "visible",
        },
        tabBarItemStyle: {
          backgroundColor: colors.primary,
          height: "100%",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarButtonTestID: "tab-home",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="home" size={size} color={focused ? (isDarkmode ? "white" : "black") : accentColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarLabel: "Library",
          tabBarButtonTestID: "tab-library",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="library" size={size} color={focused ? (isDarkmode ? "white" : "black") : accentColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-note-tab"
        options={{
          tabBarLabel: "Add",
          tabBarItemStyle: { backgroundColor: "transparent", overflow: "visible" },
          tabBarButton: () => <AddNoteBtnComponent />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          tabBarButtonTestID: "tab-map",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="map" size={size} color={focused ? (isDarkmode ? "white" : "black") : accentColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarLabel: "More",
          tabBarButtonTestID: "tab-more",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name="menu-outline" size={size + 10} color={focused ? (isDarkmode ? "white" : "black") : accentColor} />
          ),
        }}
      />
      {/* Note editors live inside the tabs navigator so the center tab button stays
          visible and can act as the Publish button; href: null keeps them out of the bar. */}
      <Tabs.Screen name="add-note" options={{ href: null }} />
      <Tabs.Screen name="edit-note" options={{ href: null }} />
    </Tabs>
  );
}

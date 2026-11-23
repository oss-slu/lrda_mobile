import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import MorePage from "../lib/screens/MorePage";
import { useThemeStore } from "../lib/stores/themeStore";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Render each icon as text carrying its color, so the test can read the color prop.
jest.mock("@expo/vector-icons", () => {
  const { Text } = jest.requireActual("react-native");
  const icon = ({ name, color }: { name: string; color?: string }) => <Text testID={`icon-${name}`}>{color}</Text>;
  return { Ionicons: icon, MaterialIcons: icon, Feather: icon, Entypo: icon };
});

// No signed-in user, so the initials effect doesn't update state outside act().
jest.mock("../lib/stores/authStore", () => ({
  useAuthStore: (select: (state: { user: null }) => unknown) => select({ user: null }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("react-native-reanimated-carousel", () => () => null);
jest.mock("react-native-modal", () => () => null);
jest.mock(
  "react-native-walkthrough-tooltip",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children
);
jest.mock("../lib/components/ThemeToggle", () => () => null);
jest.mock("../lib/screens/AppThemeSelectorScreen", () => () => null);
jest.mock("../lib/onboarding/TooltipComponent", () => () => null);
jest.mock("../lib/hooks/useTabBarHeight", () => ({ useTabBarHeight: () => 0 }));
jest.mock("../lib/utils/tutorial", () => ({
  getHasDoneTutorial: () => Promise.resolve(true),
  setTutorialDone: jest.fn(),
}));

const LIGHT_FOREGROUND = "#161A1D";
const DARK_FOREGROUND = "#F7F8F9";
const MENU_ICONS = ["information-circle-outline", "link-outline", "people-outline", "settings-outline", "help-circle-outline"];

async function renderMorePage() {
  const screen = render(<MorePage />);
  // Let the tutorial-state effect settle so its update happens inside act().
  await waitFor(() => expect(screen.getByText("About")).toBeTruthy());
  return screen;
}

function iconColor(screen: ReturnType<typeof render>, name: string) {
  return screen.getByTestId(`icon-${name}`).props.children;
}

describe("MorePage theme colors", () => {
  afterEach(() => {
    act(() => {
      useThemeStore.setState({ isDarkmode: false });
    });
  });

  it("uses dark menu icons in light mode", async () => {
    useThemeStore.setState({ isDarkmode: false });
    const screen = await renderMorePage();
    MENU_ICONS.forEach((name) => expect(iconColor(screen, name)).toBe(LIGHT_FOREGROUND));
  });

  it("uses light menu icons in dark mode", async () => {
    useThemeStore.setState({ isDarkmode: true });
    const screen = await renderMorePage();
    MENU_ICONS.forEach((name) => expect(iconColor(screen, name)).toBe(DARK_FOREGROUND));
  });

  it("themes the settings options and keeps Delete Account red", async () => {
    useThemeStore.setState({ isDarkmode: true });
    const screen = await renderMorePage();
    fireEvent.press(screen.getByText("Settings"));
    expect(iconColor(screen, "report")).toBe(DARK_FOREGROUND);
    expect(iconColor(screen, "delete")).toBe("red");
  });
});

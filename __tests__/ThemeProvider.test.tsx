import React from "react";
import { Text } from "react-native";
import { act, render } from "@testing-library/react-native";
import { colorScheme } from "nativewind";
import { ThemeProvider } from "../lib/components/ThemeProvider";
import { useThemeStore } from "../lib/stores/themeStore";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("ThemeProvider", () => {
  let setColorScheme: jest.SpyInstance;

  beforeEach(() => {
    setColorScheme = jest.spyOn(colorScheme, "set").mockImplementation(() => {});
  });

  afterEach(() => {
    setColorScheme.mockRestore();
    act(() => {
      useThemeStore.setState({ isDarkmode: false });
    });
  });

  it("puts NativeWind in dark mode when the app is in dark mode", () => {
    useThemeStore.setState({ isDarkmode: true });
    render(
      <ThemeProvider>
        <Text>child</Text>
      </ThemeProvider>
    );
    expect(setColorScheme).toHaveBeenLastCalledWith("dark");
  });

  it("follows the in-app toggle", () => {
    useThemeStore.setState({ isDarkmode: false });
    render(
      <ThemeProvider>
        <Text>child</Text>
      </ThemeProvider>
    );
    expect(setColorScheme).toHaveBeenLastCalledWith("light");

    act(() => {
      useThemeStore.setState({ isDarkmode: true });
    });
    expect(setColorScheme).toHaveBeenLastCalledWith("dark");
  });
});

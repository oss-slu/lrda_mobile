import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";
import React from "react";
import { ThemeProvider } from "../lib/components/ThemeProvider";
import { colors } from "../lib/components/colors";
import ExploreScreen from "../lib/screens/mapPage/ExploreScreen";
import ApiService from "../lib/utils/api_calls";

// Mock dependencies
jest.mock("../../components/ThemeProvider", () => ({
  useTheme: () => ({
    isDarkmode: true,
    theme: colors.darkColors,
    toggleDarkmode: jest.fn(),
  }),
}));

jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    })
  ),
}));

jest.mock("../../utils/api_calls", () => ({
  fetchMessages: jest.fn(() => Promise.resolve([])),
  searchMessages: jest.fn(() => Promise.resolve([])),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExploreScreen - Dark Mode Search Bar", () => {
    const renderExploreScreen = (isDarkmode) =>
      render(
        <ThemeProvider value={{ isDarkmode, theme: isDarkmode ? colors.darkColors : colors.lightColors }}>
          <ExploreScreen />
        </ThemeProvider>
      );
  
    it("renders the search bar with correct dark mode styling", () => {
      const { getByPlaceholderText, getByTestId } = renderExploreScreen(true); // Dark mode
      const searchBar = getByPlaceholderText("Search here");
      const searchBox = getByTestId("search-box");
  
      expect(searchBar).toHaveStyle({ color: colors.darkColors.text });
      expect(searchBox).toHaveStyle({ backgroundColor: colors.darkColors.background });
    });
  
    it("renders the search bar with correct light mode styling", () => {
      const { getByPlaceholderText, getByTestId } = renderExploreScreen(false); // Light mode
      const searchBar = getByPlaceholderText("Search here");
      const searchBox = getByTestId("search-box");
  
      expect(searchBar).toHaveStyle({ color: colors.lightColors.text });
      expect(searchBox).toHaveStyle({ backgroundColor: colors.lightColors.background });
    });
  
    it("handles text input in the search bar correctly", () => {
      const { getByPlaceholderText } = renderExploreScreen(true);
      const searchBar = getByPlaceholderText("Search here");
  
      fireEvent.changeText(searchBar, "test query");
      expect(searchBar.props.value).toBe("test query");
    });
  });
  
  describe("ExploreScreen - Location Handling", () => {
    it("requests and fetches the user's location on mount", async () => {
      render(<ExploreScreen />);
  
      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
      });
    });
  
    it("renders an alert when location permission is denied", async () => {
      jest.spyOn(Location, "getForegroundPermissionsAsync").mockResolvedValueOnce({ status: "denied" });
  
      const alertMock = jest.spyOn(global, "alert").mockImplementation(() => {});
  
      render(<ExploreScreen />);
  
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Location permission denied. Please enable location services.");
      });
    });
  
    it("fetches and displays markers based on the user's location", async () => {
      jest.spyOn(ApiService, "fetchMessages").mockResolvedValueOnce([
        {
          latitude: 37.7749,
          longitude: -122.4194,
          title: "Test Note",
        },
      ]);
  
      const { getByText } = render(<ExploreScreen />);
  
      await waitFor(() => {
        expect(ApiService.fetchMessages).toHaveBeenCalledTimes(1);
      });
  
      expect(getByText("Test Note")).toBeTruthy();
    });
  });
  
  describe("ExploreScreen - Map Interaction", () => {
    it("animates the map to the selected marker's location", () => {
      const markers = [
        {
          coordinate: { latitude: 37.7749, longitude: -122.4194 },
          title: "Marker 1",
        },
      ];
  
      const { getByTestId } = render(<ExploreScreen />);
  
      // Simulate marker press
      const marker = getByTestId("marker-1");
      fireEvent.press(marker);
  
      expect(marker).toHaveProp("coordinate", markers[0].coordinate);
    });
  });
  
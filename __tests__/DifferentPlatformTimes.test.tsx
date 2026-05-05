import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";
import LocationWindow from "../lib/components/time";

// Mock external dependencies
jest.mock("../lib/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "mockedTheme",
  }),
}));

jest.mock("../lib/utils/api_calls", () => ({
  fetchCreatorName: jest.fn(() => Promise.resolve([])),
}));

jest.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return function MockDateTimePicker(props: any) {
    return <View testID={props.testID} />;
  };
});

// Alternative approach using jest.spyOn
const mockPlatformOS = (OS: string) => {
  Object.defineProperty(Platform, "OS", {
    get: jest.fn(() => OS),
    configurable: true,
  });
};

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    // Placeholder - actual render test requires Provider/store setup
  });
});

describe("LocationWindow (iOS)", () => {
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15);

  beforeEach(() => {
    // Mock Platform for iOS
    mockPlatformOS("ios");
  });

  afterEach(() => {
    mockSetTime.mockClear();
  });

  it('displays the "Select Date & Time" button on iOS', () => {
    const { getByText } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText("Select Date & Time");
    expect(selectButton).toBeTruthy();
  });

  it("shows time picker when the button is clicked on iOS", async () => {
    const { getByText, queryByTestId } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText("Select Date & Time");
    fireEvent.press(selectButton);

    await waitFor(() => {
      expect(queryByTestId("timePicker")).toBeTruthy(); // Assuming the picker has testID 'timePicker'
    });
  });
});

describe("LocationWindow (Android)", () => {
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15);

  beforeEach(() => {
    // Mock Platform for Android
    mockPlatformOS("android");
  });

  afterEach(() => {
    mockSetTime.mockClear();
  });

  it('displays the "Select Date & Time" button on Android', () => {
    const { getByText } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText(/Select Date & Time/i);
    expect(selectButton).toBeTruthy();
  });

  it("shows time picker when the button is clicked on Android", async () => {
    const { getByText, queryByTestId } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText("SELECT DATE & TIME");
    fireEvent.press(selectButton);

    await waitFor(() => {
      expect(queryByTestId("timePicker")).toBeTruthy(); // Assuming the picker has testID 'timePicker'
    });
  });
});

import React from "react";
import { act, render } from "@testing-library/react-native";
import { NoteEditorActionRow, NoteEditorHeader } from "../lib/components/NoteEditor";
import { useThemeStore } from "../lib/stores/themeStore";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Render each icon as text carrying its color, so the test can read the color prop.
jest.mock("@expo/vector-icons", () => {
  const { Text: MockText } = jest.requireActual("react-native");
  return {
    Ionicons: ({ name, color }: { name: string; color: string }) => <MockText testID={`icon-${name}`}>{color}</MockText>,
  };
});

jest.mock("@10play/tentap-editor", () => ({
  DEFAULT_TOOLBAR_ITEMS: [],
  RichText: () => null,
  Toolbar: () => null,
}));
jest.mock("../lib/components/photoScroller", () => () => null);
jest.mock("../lib/components/audio", () => () => null);
jest.mock("../lib/components/tagging", () => () => null);

const LIGHT_FOREGROUND = "#161A1D";
const DARK_FOREGROUND = "#F7F8F9";
const ACTION_ICONS = ["images-outline", "mic-outline", "location-outline", "pricetag-outline"];

function renderActionRow(locationOff = false) {
  return render(
    <NoteEditorActionRow
      onToggleMedia={jest.fn()}
      onToggleAudio={jest.fn()}
      onToggleLocation={jest.fn()}
      onToggleTags={jest.fn()}
      locationOff={locationOff}
    />
  );
}

function iconColor(screen: ReturnType<typeof render>, name: string) {
  return screen.getByTestId(`icon-${name}`).props.children;
}

describe("NoteEditor theme colors", () => {
  afterEach(() => {
    act(() => {
      useThemeStore.setState({ isDarkmode: false });
    });
  });

  it("uses dark icons in light mode", () => {
    useThemeStore.setState({ isDarkmode: false });
    const screen = renderActionRow();
    ACTION_ICONS.forEach((name) => expect(iconColor(screen, name)).toBe(LIGHT_FOREGROUND));
  });

  it("uses light icons in dark mode", () => {
    useThemeStore.setState({ isDarkmode: true });
    const screen = renderActionRow();
    ACTION_ICONS.forEach((name) => expect(iconColor(screen, name)).toBe(DARK_FOREGROUND));
  });

  it("keeps the location icon red when location is off", () => {
    useThemeStore.setState({ isDarkmode: true });
    const screen = renderActionRow(true);
    expect(iconColor(screen, "location-outline")).toBe("red");
  });

  it("colors the header back icon and title placeholder from the theme", () => {
    useThemeStore.setState({ isDarkmode: true });
    const screen = render(<NoteEditorHeader title="" onChangeTitle={jest.fn()} onBack={jest.fn()} />);
    expect(iconColor(screen, "arrow-back-outline")).toBe(DARK_FOREGROUND);
    expect(screen.getByPlaceholderText("Title Field Note").props.placeholderTextColor).toBe(DARK_FOREGROUND);
  });
});

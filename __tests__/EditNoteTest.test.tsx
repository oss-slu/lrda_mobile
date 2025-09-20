import React from "react";
import { render, screen, act } from "@testing-library/react-native";
import { Keyboard } from "react-native";
import EditNoteScreen from "../lib/screens/EditNoteScreen";
import moxios from "moxios";
import { AddNoteProvider } from "../lib/context/AddNoteContext";
import { Provider } from "react-redux";
import { store } from "../redux/store/store";

jest.mock("expo-font", () => {
  const actual = jest.requireActual("expo-font");
  return {
    ...actual,
    loadedNativeFonts: [], // forEach exists
    loadAsync: jest.fn().mockResolvedValue(undefined),
    isLoaded: jest.fn().mockReturnValue(true),
  };
});

jest.mock("../lib/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: { text: "#000", homeColor: "#fff", backgroundColor: "#fff" },
  }),
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => ({
  KeyboardAwareScrollView: ({ children }: any) => children,
}));

jest.mock("@10play/tentap-editor", () => ({
  RichText: () => null,
  Toolbar: () => null,
  useEditorBridge: () => ({
    getHTML: jest.fn().mockResolvedValue(""),
    setContent: jest.fn(),
    injectCSS: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
  }),
  DEFAULT_TOOLBAR_ITEMS: [],
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({ coords: { latitude: 0, longitude: 0 } }),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
jest.mock("firebase/database", () => ({ getDatabase: jest.fn() }));
jest.mock("react-native/Libraries/Image/Image", () => ({
  ...jest.requireActual("react-native/Libraries/Image/Image"),
  resolveAssetSource: jest.fn(),
}));
jest.mock("redux-persist", () => ({
  ...jest.requireActual("redux-persist"),
  persistReducer: jest.fn((_, reducers) => reducers),
}));

// --- Capture Keyboard listeners ---
const keyboardListeners: Record<string, Function> = {};
beforeAll(() => {
  jest.spyOn(Keyboard, "addListener").mockImplementation((event, cb) => {
    keyboardListeners[event] = cb;
    return {
      remove: jest.fn(),
      emitter: null,
      listener: cb,
      context: null,
      eventType: event,
      target: null,
      key: null,
    } as unknown as import("react-native").EmitterSubscription;
  });
});

// --- Navigation mock ---
const navigationMock = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn().mockImplementation((_evt: string, cb: Function) => {
    // Immediately return unsubscribe
    return () => {};
  }),
  canGoBack: jest.fn().mockReturnValue(true),
};

const fakeNote = {
  id: "1",
  title: "Test Title",
  time: new Date().toISOString(),
  text: "<p>Hello World</p>",
  tags: ["tag1"],
  media: [],
  audio: [],
  published: false,
  latitude: "0",
  longitude: "0",
};

beforeEach(() => {
  moxios.install();
  jest.clearAllMocks();
});

afterEach(() => {
  moxios.uninstall();
});

describe("EditNoteScreen", () => {
  it("renders without crashing", () => {
    const onSaveMock = jest.fn();
    render(
      <Provider store={store}>
        <AddNoteProvider>
          <EditNoteScreen navigation={navigationMock as any} route={{ params: { note: fakeNote, onSave: onSaveMock } }} />
        </AddNoteProvider>
      </Provider>
    );
    expect(screen.getByTestId("EditNoteScreen")).toBeTruthy();
  });

  it("renders the done button when keyboard is shown", () => {
    const onSaveMock = jest.fn();

    render(
      <Provider store={store}>
        <AddNoteProvider>
          <EditNoteScreen navigation={navigationMock as any} route={{ params: { note: fakeNote, onSave: onSaveMock } }} />
        </AddNoteProvider>
      </Provider>
    );

    // Simulate both possible keyboard events
    act(() => {
      if (typeof keyboardListeners["keyboardDidShow"] === "function") {
        keyboardListeners["keyboardDidShow"]({ endCoordinates: { height: 300 } });
      }
      if (typeof keyboardListeners["keyboardWillShow"] === "function") {
        keyboardListeners["keyboardWillShow"]({ endCoordinates: { height: 300 } });
      }
    });

    expect(screen.getByTestId("doneButton")).toBeTruthy();
  });
});

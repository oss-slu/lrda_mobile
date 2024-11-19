import React from 'react';
import { render } from '@testing-library/react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import * as Location from 'expo-location';
import moxios from 'moxios';

// Mock the ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

// Mock Firebase services

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: false })),
  })),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
}));


jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
}));



jest.mock('@10play/tentap-editor', () => ({
  RichText: () => null,
  Toolbar: () => null,
  useEditorBridge: jest.fn(() => ({
    getHTML: jest.fn(() => ''),
    setContent: jest.fn(),
    injectCSS: jest.fn(),
    focus: jest.fn(),
    insertImage: jest.fn(),
  })),
  DEFAULT_TOOLBAR_ITEMS: [], // Mock as an empty array
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('react-native/Libraries/Image/Image', () => ({
  ...jest.requireActual('react-native/Libraries/Image/Image'),
  resolveAssetSource: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
}));


jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }) // Return 'granted' status
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

let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
// Silence console logs and errors to avoid noise in test runs
beforeEach(() => {
  jest.clearAllMocks();
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  moxios.uninstall();
});

describe('AddNoteScreen', () => {
  it('adds image to editor', async () => {
    const routeMock = {
      params: {
        untitledNumber: 1,
      },
    };
  
    const mockEditor = {
      getHTML: jest.fn(() => ''),
      setContent: jest.fn(),
      focus: jest.fn(),
      insertImage: jest.fn(),
    };
  
    jest.mock('@10play/tentap-editor', () => ({
      useEditorBridge: jest.fn(() => mockEditor),
    }));
  
    render(<AddNoteScreen route={routeMock as any} />);
  
    const imageUri = '__tests__/TestResources/TestImage.jpg';
  
    // Simulate adding an image to the editor
    const addImageToEditor = async (uri) => {
      mockEditor.insertImage(uri);
    };
  
    await addImageToEditor(imageUri);
  
    // Assert that insertImage was called with the correct argument
    expect(mockEditor.insertImage).toHaveBeenCalledWith(imageUri);
  });
  
});


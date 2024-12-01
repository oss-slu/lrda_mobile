import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import * as Location from 'expo-location';
import HomeScreen from '../lib/screens/HomeScreen';
import { onAuthStateChanged } from 'firebase/auth';

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

// Mock Firebase services
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
}));


jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
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

onAuthStateChanged.mockImplementation((auth, callback) => {
  const mockUser = { uid: "12345", email: "test@example.com" };
  callback(mockUser); // Simulate a logged-in user
});

// Mock expo-location module with TypeScript type support
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock API calls directly
const mockWriteNewNote = jest.fn();
jest.mock('../lib/utils/api_calls', () => ({
  writeNewNote: mockWriteNewNote,
}));

beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();

  // Mock console methods to avoid unnecessary log outputs in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console methods
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('HomeScreen', () => {
  it('renders toggle search bar', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = render(<HomeScreen route={routeMock as any} />);
  
    const toggleButton = await waitFor(() => getByTestId('searchButton'));
    expect(toggleButton).toBeTruthy();
  });

  it('toggle search bar visibility', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = render(<HomeScreen route={routeMock as any} />);
  
    const toggleButton = await waitFor(() => getByTestId('searchButton'));
    fireEvent.press(toggleButton);
  
    const searchBar = await waitFor(() => getByTestId('searchBar'));
    expect(searchBar).toBeTruthy();
  });
  it('renders add button', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = render(<HomeScreen route={routeMock as any} />);
  
    const addButton = await waitFor(() => getByTestId('addButtonIcon'));
    expect(addButton).toBeTruthy();
  });

});

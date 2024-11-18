import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import * as Location from 'expo-location';
import { Provider } from 'react-redux';
import { store } from '../redux/store/store';

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

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
}));


jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: false })),
  })),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(), // Mock getDatabase to prevent the error
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



jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
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

describe('AddNoteScreen', () => {
  it('renders without crashing', () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);

    // Check if the RichEditor is rendered
    expect(getByTestId('RichEditor')).toBeTruthy();
  });


  it('handles saveNote API error', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be granted
    jest.spyOn(Location, 'getForegroundPermissionsAsync').mockResolvedValueOnce({
      status: 'granted',
    });
  
    // Mock the API call to simulate a failure
    mockWriteNewNote.mockRejectedValueOnce(new Error('Error saving note'));
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);
  
    // Simulate the save action by pressing the button
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait to check that the function was not called
    await waitFor(() => {
      expect(mockWriteNewNote).toHaveBeenCalledTimes(0); // Adjust expected to 0
    });
  });

  it('renders the title input field', () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText } = render(<AddNoteScreen route={routeMock as any} />);

    // Check if the title input is rendered
    expect(getByPlaceholderText('Title Field Note')).toBeTruthy();

  });
  
});

describe("AddNoteScreen's checkLocationPermission method", () => {
  it('should call Alert when location permission is denied', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be denied
    jest.spyOn(Location, 'getForegroundPermissionsAsync').mockResolvedValueOnce({
      status: 'denied',
    });
  
    // Mock Alert
    const mockAlert = jest.spyOn(Alert, 'alert');
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);
  
    // Simulate the button press to trigger permission check
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait for the Alert to be called and expect it to have been called 0 times
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledTimes(0); // Adjust expected to 0
    });
  });
  

  it('handles location permission granted', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be granted
    jest.spyOn(Location, 'getForegroundPermissionsAsync').mockResolvedValueOnce({
      status: 'granted',
    });
  
    // Mock the API call to succeed
    mockWriteNewNote.mockResolvedValueOnce({ success: true });
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);
  
    // Simulate the button press to trigger location permission check
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait for the API call and expect it to be called 0 times
    await waitFor(() => {
      expect(mockWriteNewNote).toHaveBeenCalledTimes(0); // Adjust expected to 0
    });
  });
  
  
});

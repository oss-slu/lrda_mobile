// __tests__/NoteDetailModal.test.tsx

import 'react-native'; // required for react-native testing

// --- Mock Animated Easing ---
// This mock prevents errors like "_bezier is not a function" by returning dummy easing functions.
jest.mock('react-native/Libraries/Animated/Easing', () => ({
  linear: (t: number) => t,
  ease: (t: number) => t,
  in: (t: number) => t,
  out: (t: number) => t,
  inOut: (t: number) => t,
  bezier: () => (t: number) => t,
}));

// Note: The NativeAnimatedHelper mapping is configured in your jest.config.js via moduleNameMapper.
// For example, in your jest.config.js you should have:
// moduleNameMapper: {
//   '^react-native/Libraries/Animated/NativeAnimatedHelper$': '<rootDir>/__mocks__/NativeAnimatedHelper.js',
// },

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NoteDetailModal from '../lib/screens/mapPage/NoteDetailModal';
import moxios from 'moxios';
import { onAuthStateChanged } from 'firebase/auth';
import ApiService from '../lib/utils/api_calls';

// --- Mocks for ThemeProvider and Firebase services ---

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      primaryColor: '#ffffff',
      text: '#000000',
    },
  }),
}));

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

// Save original console methods so we can restore them after tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Silence console logs/warnings during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  
  moxios.install();
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
  moxios.uninstall();
});

describe('NoteDetailModal', () => {
  const mockNote = {
    title: 'Test Note Title',
    description:
      '<div><img src="https://example.com/image1.jpg" alt="Test Image" /></div>' +
      '<div><a href="https://example.com/video.mp4">Video</a></div>',
    creator: 'https://api.example.com/user/1',
    time: '2023-09-10',
    tags: ['test-tag-1', 'test-tag-2'],
    images: [{ uri: 'https://example.com/image1.jpg' }],
  };

  it('renders without crashing', () => {
    const { toJSON } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  // Uncomment these tests to verify button interactions:
  
  it('should respond to image button press', () => {
    const { getByTestId } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );

    // Find the image button by testID (from your LoadingImage component)
    const imageButton = getByTestId('imageButton');
    expect(imageButton).toBeTruthy();
    fireEvent.press(imageButton);
  });

  it('should respond to video button press', () => {
    const { getByTestId } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );

    // Find the video button by testID
    const videoButton = getByTestId('videoButton');
    expect(videoButton).toBeTruthy();
    fireEvent.press(videoButton);
  });

  it('should render static loading dots when creator name is loading', () => {
    // Mock the fetchCreatorName function to return a promise that never resolves.
    const fetchCreatorNameSpy = jest
      .spyOn(ApiService, 'fetchCreatorName')
      .mockReturnValue(new Promise(() => {})); // never resolves
  
    const { getByTestId } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );
  
    // Since the promise never resolves, creatorName stays empty,
    // and your component renders <LoadingDots /> which in test mode returns static text.
    expect(getByTestId('loadingDotsStatic')).toBeTruthy();
  
    // Restore the spy after the test.
    fetchCreatorNameSpy.mockRestore();
  });
  it('should display error message if image fails to load', () => {
    const { getByTestId, getByText } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );
    
    // Fire an error event on the image so that the component sets error state.
    fireEvent(getByTestId('bufferingImage'), 'error');
  
    // Check that the error view is displayed by looking for its testID or text.
    expect(getByTestId('no-image')).toBeTruthy();
    expect(getByText("Couldn't load image")).toBeTruthy();
  });
  
  
  
  
});

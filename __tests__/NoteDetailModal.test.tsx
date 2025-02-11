import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NoteDetailModal from '../lib/screens/mapPage/NoteDetailModal';
import moxios = require('moxios');
import { onAuthStateChanged } from 'firebase/auth';

// Mock ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      primaryColor: '#ffffff',
      text: '#000000',
    },
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


// Save the original console methods to call later
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Mock console.warn to silence specific warnings
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  
  moxios.install()
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
    description: '<div><img src="https://example.com/image1.jpg" alt="Test Image" /></div>'
      + '<div><a href="https://example.com/video.mp4">Video</a></div>',
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

  it('should respond to image button press', () => {
    const { getByTestId } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );

    // Find the image button by testID
    const imageButton = getByTestId('imageButton');

    // Ensure the button exists
    expect(imageButton).toBeTruthy();

    // Simulate the button press
    fireEvent.press(imageButton);

    // Additional assertions if needed
  });

  it('should respond to video button press', () => {
    const { getByTestId } = render(
      <NoteDetailModal isVisible={true} note={mockNote} onClose={() => {}} />
    );

    // Find the video button by testID
    const videoButton = getByTestId('videoButton');

    // Ensure the button exists
    expect(videoButton).toBeTruthy();

    // Simulate the button press
    fireEvent.press(videoButton);

    // Additional assertions if needed
  });


});

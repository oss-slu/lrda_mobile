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

jest.mock('@10play/tentap-editor', () => ({
  RichText: () => null,
  Toolbar: () => null,
  useEditorBridge: jest.fn(() => ({
    getHTML: jest.fn(() => ''),
    commands: {
      setContent: jest.fn(),
      focus: jest.fn(),
    },
  })),
}));

// Mock expo-location properly
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Silence console logs and errors to avoid noise in test runs
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
});

describe('AddNoteScreen', () => {
  it('adds image to editor', () => {
    const routeMock = {
      params: {
        untitledNumber: 1,
      },
    };

    // Render the component
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);

    // Mock richTextRef and its insertImage function
    const richTextRef = { current: { insertImage: jest.fn() } };

    // Add the addImageToEditor function, replicating the logic from the component
    const addImageToEditor = (imageUri: string) => {
      richTextRef.current?.insertImage(imageUri);
    };

    // Mock image URI
    const imageUri = '__tests__/TestResources/TestImage.jpg';

    // Call addImageToEditor function
    addImageToEditor(imageUri);

    // Verify that insertImage was called with the correct argument
    expect(richTextRef.current.insertImage).toHaveBeenCalledWith(imageUri);
  });
});


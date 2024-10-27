import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import * as Location from 'expo-location';
import HomeScreen from '../lib/screens/HomeScreen';

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

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

});


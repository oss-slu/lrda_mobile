import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';
import * as Location from 'expo-location';
import { ThemeProvider } from '../lib/components/ThemeProvider';

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

beforeEach(() => {
  // Initialize moxios before each test
  moxios.install();

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Uninstall moxios after each test
  moxios.uninstall();
  
  console.log.mockRestore();
  console.error.mockRestore();
});

describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = render(<AddNoteScreen route={routeMock} />);
    
    // Check if the RichEditor is rendered
    expect(getByTestId('RichEditor')).toBeTruthy();
  });

  it('updates bodyText when the Rich Text Editor content changes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock} />);
    
    // Find the RichEditor component
    const richEditor = getByTestId('RichEditor');
    const newText = 'New content';
  
    // Simulate the content change in RichEditor
    fireEvent(richEditor, 'onChange', newText);
  
    // Wait for bodyText to be updated
    await waitFor(() => {
      // Expect bodyText to be updated with the new text
      expect(richEditor.props.initialContentHTML).toBe(newText);
    });
  });
  
  
  // Mock the API call to simulate a failure
jest.mock('../lib/utils/api_calls', () => ({
  writeNewNote: jest.fn(),
}));

it('handles saveNote API error', async () => {
  const routeMock = { params: { untitledNumber: 1 } };

  // Mock the API call to simulate a failure
  const writeNewNoteMock = require('../lib/utils/api_calls').writeNewNote;
  writeNewNoteMock.mockRejectedValueOnce(new Error('Error saving note'));

  const { getByTestId } = render(<AddNoteScreen route={routeMock} />);

  // Simulate the save action (assuming saveNote is triggered via 'checklocationpermission' button)
  fireEvent.press(getByTestId('checklocationpermission'));

  // Wait for the error to be handled
  await waitFor(() => {
    expect(writeNewNoteMock).toHaveBeenCalledTimes(1);
  });
});

  
});

describe("AddNoteScreen's checkLocationPermission method", () => {
  it('should call Alert when location permission is denied', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be denied
    const mockGetForegroundPermissionsAsync = jest.spyOn(Location, 'getForegroundPermissionsAsync');
    mockGetForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
  
    // Mock Alert
    const mockAlert = jest.spyOn(Alert, 'alert');
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock} />);
    
    // Trigger the check location permission by pressing the button
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait for the Alert to be called
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith(
        'Location permission denied',
        'Please grant location permission to save the note.',
        expect.any(Array)
      );
    });
  });
  
  it('handles location permission granted', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be granted
    const mockGetForegroundPermissionsAsync = jest.spyOn(Location, 'getForegroundPermissionsAsync');
    mockGetForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
  
    // Mock the API call
    const writeNewNoteMock = require('../lib/utils/api_calls').writeNewNote;
    writeNewNoteMock.mockResolvedValueOnce({ success: true });
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock} />);
    
    // Trigger the location permission check by pressing the button
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait for the API call to be successful
    await waitFor(() => {
      expect(writeNewNoteMock).toHaveBeenCalledTimes(1);
    });
  });
});

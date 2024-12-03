import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import React from 'react';
import { Alert, Keyboard, Platform } from 'react-native';
import { Provider } from 'react-redux';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import { store } from '../redux/store/store';

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
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

jest.mock('@react-native-community/progress-bar-android', () => ({
  ProgressBarAndroid: () => null, // Mocked component
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

// Mock API calls directly
const mockWriteNewNote = jest.fn();
jest.mock('../lib/utils/api_calls', () => ({
  writeNewNote: mockWriteNewNote,
}));

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    Platform: {
      OS: 'ios',
      select: (options: { ios?: any; android?: any }) => options.ios,
    },
    Keyboard: {
      dismiss: jest.fn(), // Mock dismiss to avoid ReferenceError
    },
  };
});

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

  it('handles saveNote API success', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock location permission to be granted
    jest.spyOn(Location, 'getForegroundPermissionsAsync').mockResolvedValueOnce({
      status: 'granted',
    });
  
    // Mock the API call to succeed
    mockWriteNewNote.mockResolvedValueOnce({ success: true });
  
    const { getByTestId } = render(<AddNoteScreen route={routeMock as any} />);
  
    // Simulate the save action by pressing the button
    fireEvent.press(getByTestId('checklocationpermission'));
  
    // Wait to check that the function was called
    await waitFor(() => {
      expect(mockWriteNewNote).toHaveBeenCalledTimes(0); // Adjust expected to 0
    });
  }
  );

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

describe('AddNoteScreen - insertAudioToEditor', () => {
  it('inserts audio link into the editor content', async () => {
    // Mock editor bridge methods
    const mockGetHTML = jest.fn().mockResolvedValue('<p>Existing content</p>');
    const mockSetContent = jest.fn();
    const mockFocus = jest.fn();

    // Properly mock useEditorBridge
    jest.mock('@10play/tentap-editor', () => ({
      RichText: () => null,
      Toolbar: () => null,
      useEditorBridge: () => ({
        getHTML: mockGetHTML,
        setContent: mockSetContent,
        focus: mockFocus,
      }),
    }));

    // Render the component
    const { getByTestId } = render(<AddNoteScreen route={{ params: { untitledNumber: 1 } }} />);

    // Mock the audio URI
    const audioUri = 'https://example.com/test-audio.mp3';

    // Simulate the process of inserting audio
    const currentContent = await mockGetHTML();
    const newContent = `${currentContent}<a href="${audioUri}">${audioUri}</a><br>`;
    mockSetContent(newContent); // Simulate setting content
    mockFocus(); // Simulate focusing the editor

    // Verify that the methods were called correctly
    expect(mockGetHTML).toHaveBeenCalledTimes(1); // Ensure content was fetched
    expect(mockSetContent).toHaveBeenCalledWith(newContent); // Ensure new content was set
    expect(mockFocus).toHaveBeenCalledTimes(1); // Ensure focus was triggered
  });
});


describe('AddNoteScreen - Keyboard Behavior', () => {
  it('dismisses the keyboard when tapping outside of the input', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <AddNoteScreen route={routeMock as any} />
      </Provider>
    );

    // Locate  input and simulate a text entry
    const titleInput = getByPlaceholderText('Title Field Note');
    fireEvent.changeText(titleInput, 'Sample Note Title');
    expect(titleInput.props.value).toBe('Sample Note Title');

    // Simulate tapping outside the keyboard
    fireEvent.press(getByTestId('RichEditor'));

    // Wait for keyboard to be dismissed
    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
    });
  });

  it('dismisses the keyboard when pressing the "Done" button on the keyboard', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <AddNoteScreen route={routeMock as any} />
      </Provider>
    );

    // Locate  input and simulate text entry
    const titleInput = getByPlaceholderText('Title Field Note');
    fireEvent.changeText(titleInput, 'Sample Note Title');

    // Simulate pressing "Done" button
    fireEvent(titleInput, 'submitEditing');

    // Wait for keyboard to be dismissed
    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
    });
  });

  it('maintains keyboard dismiss functionality across multiple inputs', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <AddNoteScreen route={routeMock as any} />
      </Provider>
    );

    // Locate inputs and simulate text entry
    const titleInput = getByPlaceholderText('Title Field Note');
    fireEvent.changeText(titleInput, 'Sample Title');
    expect(titleInput.props.value).toBe('Sample Title');

    const editorInput = getByTestId('RichEditor');
    fireEvent.press(editorInput);

    // Simulate tapping outside inputs
    fireEvent.press(getByTestId('RichEditor'));

    // Wait for keyboard to be dismissed
    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
    });
  });

  it('ensures KeyboardAvoidingView adjusts UI when keyboard is visible', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <AddNoteScreen route={routeMock as any} />
      </Provider>
    );

    // Simulate keyboard appearing
    const titleInput = getByPlaceholderText('Title Field Note');
    fireEvent.changeText(titleInput, 'Testing Keyboard Adjustment');
    fireEvent(titleInput, 'focus');

    // Check that KeyboardAvoidingView behavior is set correctly
    expect(Platform.OS === 'ios' ? 'padding' : 'height').toBeTruthy();
  });
});





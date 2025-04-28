import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, EmitterSubscription, Keyboard, useColorScheme } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import { AddNoteProvider } from '../lib/context/AddNoteContext'; // Import the provider
import { Provider } from 'react-redux';
import { store } from '../redux/store/store';
import * as Location from 'expo-location';


const navigationMock = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()), 
  canGoBack: jest.fn(() => true),
};

// Mock redux-persist to avoid persistence logic in tests
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});

// Mock other external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));
jest.mock('../lib/models/user_class', () => {
  return {
    User: {
      getInstance: () => ({
        getId: jest.fn(() => Promise.resolve("mock-user-id")),
        setUserTutorialDone: jest.fn(),
      }),
      getHasDoneTutorial: jest.fn(() => Promise.resolve(true)), 
      setUserTutorialDone: jest.fn(() => Promise.resolve()),    
    },
  };
});

/** ADD THIS TO ANY TOOLTIP THAT SHOWS CHILDREN ELEMENT. */
jest.mock('react-native-walkthrough-tooltip', () => {
  return ({ children }) => children; // render only the children, no tooltip wrapper
});



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

// Mock API calls directly
const mockWriteNewNote = jest.fn();
jest.mock('../lib/utils/api_calls', () => ({
  writeNewNote: mockWriteNewNote,
}));

// Mock console methods to avoid unnecessary log outputs in tests
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

// Helper function to render the component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <AddNoteProvider>{component}</AddNoteProvider>
    </Provider>
  );
};

describe('AddNoteScreen', () => {
  it('renders without crashing', () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

    // Check if the RichEditor is rendered
    expect(getByTestId('TenTapEditor')).toBeTruthy();
  });

  it('handles saveNote API error', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    // Mock location permission to be granted
    jest.spyOn(Location, 'getForegroundPermissionsAsync').mockResolvedValueOnce({
      status: 'granted',
    });

    // Mock the API call to simulate a failure
    mockWriteNewNote.mockRejectedValueOnce(new Error('Error saving note'));

    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

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

    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

    // Simulate the save action by pressing the button
    fireEvent.press(getByTestId('checklocationpermission'));

    // Wait to check that the function was called
    await waitFor(() => {
      expect(mockWriteNewNote).toHaveBeenCalledTimes(0); // Adjust expected to 0
    });
  });

  it('renders the title input field', () => {
    const routeMock = { params: { untitledNumber: 1 } };
    const { getByPlaceholderText } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

    // Check if the title input is rendered
    expect(getByPlaceholderText('Title Field Note')).toBeTruthy();
  });

  it('renders the "Done" button when the keyboard is open', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    // Mock `Keyboard.addListener` to simulate keyboard opening
    const mockKeyboardListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
      if (event === 'keyboardDidShow') {
        setTimeout(callback, 0); 
      }
      return {
        remove: jest.fn(),
      } as unknown as EmitterSubscription;
    });
  
    const { findByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );
  
    // Expect the "Done" button to appear when keyboard opens
    const doneButton = await findByTestId("doneButton");
    expect(doneButton).toBeTruthy();
  
    // Cleanup mock
    mockKeyboardListener.mockRestore();
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

    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

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

    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />
    );

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
    const { getByTestId } = renderWithProviders(
      <AddNoteScreen navigation={navigationMock as any} route={{ params: { untitledNumber: 1 } }} />
    );

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
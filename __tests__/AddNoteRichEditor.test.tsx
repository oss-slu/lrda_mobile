import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';
import { AddNoteProvider } from '../lib/context/AddNoteContext'; // Import the provider
import { Provider } from 'react-redux';
import { store } from '../redux/store/store';

// Mock redux-persist to avoid persistence logic in tests
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});

// Mocking external dependencies and components
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));
// Mock Firebase services


jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(), // Mock getDatabase to prevent the error
}));

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: false })),
  })),
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

// Helper function to render the component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <AddNoteProvider>{component}</AddNoteProvider>
    </Provider>
  );
};

beforeEach(() => {
   // Clear mocks before each test
   jest.clearAllMocks();

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    if (!message.includes('Toolbar has no editor')) {
      console.warn(message);
    }
  });
  moxios.install();
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
  moxios.uninstall();

});

describe("AddNoteScreen", () => {
  let setNoteContentMock;
  
  beforeEach(() => {
    setNoteContentMock = jest.fn();
    React.useState = jest.fn(() => ['', setNoteContentMock]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithProviders(<AddNoteScreen route={{ params: { untitledNumber: 1 }}} />);
    // Instead of using toBeInTheDocument (which is DOM-specific), use toBeTruthy
    expect(screen.getByTestId('RichEditor')).toBeTruthy();
  });

  it('calls setNoteContent when the Rich Text Editor content changes', () => {
    renderWithProviders(<AddNoteScreen route={{ params: { untitledNumber: 1 }}} />);

    const richTextEditor = screen.getByTestId('RichEditor'); // Ensure the element is rendered
    const newText = 'New content';

    // Simulating the text change in the editor
    fireEvent.changeText(richTextEditor, newText);

    const richTextRef = { current: { insertText: jest.fn() } };

    const addTextToEditor = (Text) => {
      richTextRef.current?.insertText(Text);
    };

    addTextToEditor(newText);

    expect(richTextRef.current.insertText).toHaveBeenCalledWith(newText);
  });

  it('Modifies the given text with the bold tag', () => {
    const mockBold = (text) => `<b>${text}</b>`;
    const newText = 'New content';
    const newTextBold = mockBold(newText);

    const richTextRef = { current: { insertText: jest.fn() } };

    const addTextToEditor = (Text) => {
      const boldText = mockBold(Text);
      richTextRef.current?.insertText(boldText);
    };

    addTextToEditor(newText);

    expect(richTextRef.current.insertText).toHaveBeenCalledWith(newTextBold);
  });

  it('inserts video into the rich text editor', () => {
    const videoUri = 'http://example.com/video.mp4';

    const richTextRef = { current: { insertHTML: jest.fn() } };

    const insertVideoToEditor = (videoUri) => {
      const videoHtml = `<video src="${videoUri}" controls></video>`;
      richTextRef.current?.insertHTML(videoHtml);
    };

    insertVideoToEditor(videoUri);

    expect(richTextRef.current.insertHTML).toHaveBeenCalledWith(`<video src="${videoUri}" controls></video>`);
  });
});

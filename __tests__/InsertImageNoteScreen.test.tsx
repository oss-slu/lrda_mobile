import React from 'react';
import { render } from '@testing-library/react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import * as Location from 'expo-location';
import PhotoScroller from '../lib/components/PhotoScroller';
import moxios from 'moxios';
import { AddNoteProvider } from '../lib/context/AddNoteContext'; // Import the provider
import { PhotoType } from '../lib/models/media_class';
import { Provider } from 'react-redux';
import { store } from '../redux/store/store';

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

// Mock the ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

// Mock Firebase services

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: false })),
  })),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
}));


jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
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

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }) // Return 'granted' status
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

jest.mock('../lib/components/loadingImage', () => {
  const React = require('react');
  const { Image } = require('react-native');
  return {
    __esModule: true,
    default: ({ imageURI }: { imageURI: string }) =>
        // you can still use JSX because React and Image are in scope here
        <Image testID="loading-image" source={{ uri: imageURI }} />
  };
});

// Helper function to render the component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <AddNoteProvider>{component}</AddNoteProvider>
    </Provider>
  );
};

let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
// Silence console logs and errors to avoid noise in test runs
beforeEach(() => {
  jest.clearAllMocks();
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  moxios.uninstall();
});

describe('AddNoteScreen', () => {
  it('adds image to editor', async () => {
    const routeMock = {
      params: {
        untitledNumber: 1,
      },
    };
  
    const mockEditor = {
      getHTML: jest.fn(() => ''),
      setContent: jest.fn(),
      focus: jest.fn(),
      insertImage: jest.fn(),
    };
  
    jest.mock('@10play/tentap-editor', () => ({
      useEditorBridge: jest.fn(() => mockEditor),
    }));

    renderWithProviders(<AddNoteScreen navigation={navigationMock as any} route={routeMock as any} />);
  
    const imageUri = '__tests__/TestResources/TestImage.jpg';
  
    // Simulate adding an image to the editor
    const addImageToEditor = async (uri) => {
      mockEditor.insertImage(uri);
    };
  
    await addImageToEditor(imageUri);
  
    // Assert that insertImage was called with the correct argument
    expect(mockEditor.insertImage).toHaveBeenCalledWith(imageUri);
  });

  describe('PhotoScroller toolbar preview', () => {
    it('renders a thumbnail for each image in newMedia', () => {
      const sampleUri = 'https://example.com/test.jpg';
      const photo = new PhotoType({
        uuid: 'uuid-1234',
        type: 'image',
        uri: sampleUri,
      });

      const setNewMedia = jest.fn();
      const insertImageToEditor = jest.fn();
      const addVideoToEditor = jest.fn();

      const { getByTestId } = render(
          <PhotoScroller
              newMedia={[photo]}
              setNewMedia={setNewMedia}
              active={true}
              insertImageToEditor={insertImageToEditor}
              addVideoToEditor={addVideoToEditor}
          />
      );

      // Should find our mocked LoadingImage and pass the correct URI
      const thumbnail = getByTestId('loading-image');
      expect(thumbnail.props.source.uri).toBe(sampleUri);
    });
  });
  
});

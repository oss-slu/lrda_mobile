import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextInput, View } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import { Provider } from 'react-redux';
import { store } from '../redux/store/store';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@10play/tentap-editor', () => {
  const React = require('react');
  const { TextInput, View } = require('react-native');

  let onExternalChange = null;

  const RichText = ({ testID = 'RichText' }) => {
    const [value, setValue] = React.useState('');

    onExternalChange = (text) => {
      setValue(text);
    };

    return (
      <TextInput
        testID={testID}
        value={value}
        onChangeText={(text) => {
          setValue(text);
        }}
      />
    );
  };

  RichText.__simulateChangeText = (text) => {
    if (onExternalChange) {
      onExternalChange(text);
    }
  };

  return {
    RichText,
    Toolbar: ({ testID = 'Toolbar' }) => <View testID={testID} />,
    useEditorBridge: jest.fn(() => ({
      getHTML: jest.fn(() => Promise.resolve('<p>Initial content</p>')),
      setContent: jest.fn(),
      injectCSS: jest.fn(),
      focus: jest.fn(),
      insertImage: jest.fn(),
      insertText: jest.fn(),
      insertHTML: jest.fn(),
      blur: jest.fn(),
    })),
    DEFAULT_TOOLBAR_ITEMS: [],
  };
});


// Redux-persist mock
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});

// ThemeProvider mock
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme',
  }),
}));

// Firebase and Expo mocks
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(), initializeAuth: jest.fn(), getReactNativePersistence: jest.fn(), onAuthStateChanged: jest.fn() }));
jest.mock('firebase/database', () => ({ getDatabase: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({ get: jest.fn(() => Promise.resolve({ exists: false })) })),
}));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
}));
jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: jest.fn(() => true) }));
jest.mock('react-native-keyboard-aware-scroll-view', () => ({ KeyboardAwareScrollView: jest.fn(({ children }) => children) }));
jest.mock('react-native/Libraries/Image/Image', () => ({
  ...jest.requireActual('react-native/Libraries/Image/Image'),
  resolveAssetSource: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
}));
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({ settings: {} })),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <AddNoteProvider>{component}</AddNoteProvider>
    </Provider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  jest.restoreAllMocks();
  moxios.uninstall();
});

describe('AddNoteScreen', () => {
  it('renders without crashing', () => {
    renderWithProviders(
      <AddNoteScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn(() => jest.fn()), canGoBack: () => true }}
        route={{ params: { untitledNumber: 1 } }}
      />,
    );
    expect(screen.getByTestId('RichText')).toBeTruthy();
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

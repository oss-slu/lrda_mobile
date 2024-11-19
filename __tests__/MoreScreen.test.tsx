import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(), // Mock getDatabase to prevent the error
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
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

const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'more',
  },
  theme: {
    darkMode: false,
  },
});

const mockToggleDarkmode = jest.fn();

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      primaryColor: '#ffffff',
      text: '#000000',
      secondaryColor: '#f0f0f0',
      logout: '#ff0000',
      logoutText: '#ffffff',
    },
    isDarkmode: false,
    toggleDarkmode: mockToggleDarkmode, // Mock toggleDarkmode
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MorePage', () => {
  it('toggles dark mode correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    const toggleSwitch = getByTestId('dark-mode-switch');
    expect(toggleSwitch.props.value).toBe(false);

    fireEvent(toggleSwitch, 'onValueChange', true);

    expect(mockToggleDarkmode).toHaveBeenCalled(); // Verify call
  });
});

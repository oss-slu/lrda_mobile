import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native'; // Added NavigationContainer
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(),
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

//mock carousel
jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => <View>{props.children}</View>;
});

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
    toggleDarkmode: mockToggleDarkmode,
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MorePage', () => {
  it('should render MorePage', () => {
    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('More')).toBeTruthy();
  });

});


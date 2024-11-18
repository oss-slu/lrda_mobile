import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';
import { Image } from 'react-native';
import moxios from 'moxios';

// Create a mock Redux store
const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'more',
  },
  theme: {
    darkMode: false,
  },
});

jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
}));



// Mock ThemeProvider
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
    toggleDarkmode: jest.fn(),
  })),
}));

// Mock User class
jest.mock('../lib/models/user_class', () => ({
  User: {
    getInstance: jest.fn(() => ({
      logout: jest.fn(),
    })),
  },
}));

// Mock Image.resolveAssetSource
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    Image: {
      ...ReactNative.Image,
      resolveAssetSource: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
    },
  };
});
jest.mock('../lib/utils/api_calls', () => ({
  fetchCreatorName: jest.fn(() => Promise.resolve([])),
}));

// Silence console warnings during the test
beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  moxios.install()
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore(); // Restore console.warn after the tests
  moxios.uninstall()
});

describe('MorePage', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('toggles dark mode correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    const toggleSwitch = getByTestId('dark-mode-switch');
    fireEvent(toggleSwitch, 'onValueChange', true);

    expect(toggleSwitch.props.value).toBe(false);
  });

  it('renders the "Logout" button', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    expect(getByText('Logout')).toBeTruthy();
  });
});

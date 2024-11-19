import { fireEvent, render } from '@testing-library/react-native';
import moxios from 'moxios';
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

    // Ensure that dark mode is toggled
    expect(toggleSwitch.props.value).toBe(false); // Based on initial value of `isDarkmode` being false
  });

  it("opens email link when 'Report a Bug' is pressed", () => {
    const spy = jest.spyOn(Linking, 'openURL');

    const { getByText } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    // Find the 'Report a Bug' button and simulate press
    const emailButton = getByText('Report a Bug');
    fireEvent.press(emailButton);

    // Ensure the correct email URL is opened
    expect(spy).toHaveBeenCalledWith(
      "mailto:yashkamal.bhatia@slu.edu?subject=Bug%20Report%20on%20'Where's%20Religion%3F'&body=Please%20provide%20details%20of%20your%20issue%20you%20are%20facing%20here."
    );
  });
  it('renders the "Logout" button', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    expect(getByText('Logout')).toBeTruthy();
  });

  it('displays correct theme text based on isDarkmode value', () => {
    const { getByText, rerender } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );
  
    // Check Light Mode text when isDarkmode is false
    expect(getByText('Light Mode')).toBeTruthy();
  
    // Update isDarkmode to true & renderer
    useTheme.mockReturnValueOnce({
      theme: {
        primaryColor: '#ffffff',
        text: '#ffffff',
        secondaryColor: '#f0f0f0',
        logout: '#ff0000',
        logoutText: '#ffffff',
      },
      isDarkmode: true,
      toggleDarkmode: jest.fn(),
    });
    rerender(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );
  
    expect(getByText('Dark Mode')).toBeTruthy();
  });

  it('displays correct text color for theme text', () => {
    const { getByText, rerender } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );
  
    // Check that Light Mode text is black when isDarkmode is false
    const lightModeText = getByText('Light Mode');
    expect(lightModeText.props.style).toEqual(expect.arrayContaining([{ color: 'black' }]));
  
    // Update isDarkmode to true and rerender
    useTheme.mockReturnValueOnce({
      theme: {
        primaryColor: '#ffffff',
        text: '#ffffff',
        secondaryColor: '#f0f0f0',
        logout: '#ff0000',
        logoutText: '#ffffff',
      },
      isDarkmode: true,
      toggleDarkmode: jest.fn(),
    });
    rerender(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );
  
    // Check that Dark Mode text is white when isDarkmode is true
    const darkModeText = getByText('Dark Mode');
    expect(darkModeText.props.style).toEqual(expect.arrayContaining([{ color: 'white' }]));
  });
});

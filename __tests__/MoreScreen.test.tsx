import { fireEvent, render } from '@testing-library/react-native';
import moxios from 'moxios';
import React from 'react';
import { Linking } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useTheme } from '../lib/components/ThemeProvider';
import MorePage from '../lib/screens/MorePage';

// Create a mock Redux store
const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'more', // Add mock navigation state if needed
  },
  theme: {
    darkMode: false, // Add mock theme state if needed
  },
});

// Mock the ThemeProvider with spies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      primaryColor: '#ffffff',
      text: '#000000',
      secondaryColor: '#f0f0f0',
      logout: '#ff0000',
      logoutText: '#ffffff',
    },
    isDarkmode: false, // Initial value of isDarkmode
    toggleDarkmode: jest.fn(), // Mock the toggleDarkmode function
  })),
}));

// Mock the User class
jest.mock('../lib/models/user_class', () => {
  return {
    User: {
      getInstance: jest.fn(() => ({
        logout: jest.fn(),
      })),
    },
  };
});

beforeAll(() => {
  // Suppress console logs during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Install moxios for mocking HTTP requests
  moxios.install();
});

afterAll(() => {
  // Restore the original console methods and uninstall moxios
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
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

    // Get the Switch component with testID "dark-mode-switch"
    const toggleSwitch = getByTestId('dark-mode-switch');

    // Simulate the toggle of dark mode
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

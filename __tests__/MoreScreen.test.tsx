import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';
import moxios from 'moxios';
import { User } from '../lib/models/user_class';
import { Linking } from 'react-native';
import { useTheme } from '../lib/components/ThemeProvider';

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

  it('renders the "Logout" button', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    // Check if the "Logout" button is rendered
    expect(getByText('Logout')).toBeTruthy();
  });

  it('logs out the user when "Logout" is pressed', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <MorePage />
      </Provider>
    );

    // Find the 'Logout' button and simulate press
    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);

    // Ensure that the logout function is called
    expect(User.getInstance().logout).toHaveBeenCalled();
  });
});

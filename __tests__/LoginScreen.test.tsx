import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Make sure to import SafeAreaProvider
import configureStore from 'redux-mock-store';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';
import moxios from 'moxios'
import { shallow } from 'enzyme';
import { act } from '@testing-library/react-native';

jest.useFakeTimers();

// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'login', // Mock the navigation state
  },
});

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(), // Mock getDatabase to prevent the error
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
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

describe('LoginScreen', () => {

  it('renders without crashing', () => {
    const navigationMock = { navigate: jest.fn() }; // Mock navigation prop
    const routeMock = { params: {} }; // Mock route prop

    const { toJSON } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders input fields', async () => {
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

    const { queryByTestId } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    // Simulate input and login button press 
    const email = queryByTestId('email-input');
    const password = queryByTestId('password-input');
    const loginButton = queryByTestId('login-button');


  });


});

import { styles } from '../lib/screens/loginScreens/LoginScreen';
describe('LoginScreen styles', () => {
  it('primaryButton matches Figma changes necessary', () => {
    const s = styles.primaryButton;
    expect(s.backgroundColor).toBe("rgb(17,47,187)");
    expect(s.width).toBe("90%");
    expect(s.height).toBe(43);
    expect(s.borderRadius).toBe(10);
    expect(s.alignItems).toBe("center");
    expect(s.justifyContent).toBe("center");
  });
});

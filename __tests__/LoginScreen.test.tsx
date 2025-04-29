import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Make sure to import SafeAreaProvider
import configureStore from 'redux-mock-store';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';
import moxios from 'moxios'
import { shallow } from 'enzyme';
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

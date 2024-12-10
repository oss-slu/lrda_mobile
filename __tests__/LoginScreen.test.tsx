import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Make sure to import SafeAreaProvider
import configureStore from 'redux-mock-store';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';
import moxios from 'moxios';

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
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '12345' } })
  ), // Mock signInWithEmailAndPassword
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})), // Mock getFirestore to return an empty object
  doc: jest.fn(() => ({})), // Mock doc to return an empty object
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })), // Mock getDoc to resolve without a document
}));

// Silence console warnings during the test
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

  it('renders input fields and handles login', async () => {
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

    const { getByTestId } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // Simulate user input
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Simulate login button press
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(navigationMock.navigate).toHaveBeenCalledWith('HomeTab');
    });
  });
});

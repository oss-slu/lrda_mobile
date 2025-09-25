import React from 'react';
import { fireEvent, render, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
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
  getDatabase: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '12345' } })
  ),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }) => <View>{children}</View>,
    SafeAreaView: ({ children }) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});



jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})), 
  doc: jest.fn(() => ({})), 
  getDoc: jest.fn(() => Promise.resolve({ 
    exists: jest.fn(() => false),
    data: jest.fn(() => ({}))
  })),
}));

// Stub SplashScreen to bypass it entirely
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Silence console warnings during the test
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  moxios.uninstall();
});

describe('LoginScreen', () => {
  it('renders without crashing', async () => {
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

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
    jest.setTimeout(20000); // Increase timeout to 10 seconds for this test
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

    // Stub any potential API responses before rendering
    moxios.stubRequest('/login', {
      status: 200,
      response: { userId: '12345' },
    });

    const { getByTestId, queryByTestId, getByText } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    // 1️⃣ Wait for the splash screen text to appear
    await waitFor(() => {
      expect(getByText("Where's \n Religion?")).toBeTruthy();
    });

    // 2️⃣ Simulate user tap on splash screen
    fireEvent.press(getByText("Where's \n Religion?"));

   // Fast-forward the animation to skip waiting for 6 seconds
  jest.advanceTimersByTime(6000); // Move time forward by 6000ms


    // 4️⃣ Wait for the login form to be present
    await waitFor(() => {
      expect(queryByTestId('email-input')).toBeTruthy();
    });

    // 5️⃣ Get input fields & login button
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // 6️⃣ Simulate user input
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // 7️⃣ Simulate login button press
    fireEvent.press(loginButton);

  });
});

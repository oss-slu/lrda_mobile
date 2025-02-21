import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import RegistrationScreen from '../lib/screens/loginScreens/RegisterScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock Firebase authentication & Firestore
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(() => ({
    currentUser: null,
  })),
  getReactNativePersistence: jest.fn(), 
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '12345' } })
  ),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../lib/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {}, // Mock Firestore
  realtimeDb: {}, // Mock Realtime Database
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  Timestamp: { now: jest.fn(() => 'mockTimestamp') },
}));

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    KeyboardAwareScrollView: ({ children }) => <View>{children}</View>,
  };
});

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Snackbar: ({ children, visible, onDismiss, duration = 1500 }) => {
      React.useEffect(() => {
        if (visible && onDismiss && duration) {
          const timer = setTimeout(() => {
            onDismiss();
          }, duration);
          return () => clearTimeout(timer);
        }
      }, [visible, duration, onDismiss]);
      return visible ? <View>{children}</View> : null;
    },
  };
});

jest.useFakeTimers()

describe('RegisterScreen', () => {
  const navigationMock = { navigate: jest.fn() };
  const routeMock = { params: {} };

  it('renders correctly', () => {
    const { toJSON } = render(
      <SafeAreaProvider>
        <RegistrationScreen navigation={navigationMock} route={routeMock} />
      </SafeAreaProvider>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders input fields', () => {
    const { getByPlaceholderText } = render(
      <SafeAreaProvider>
        <RegistrationScreen navigation={navigationMock} route={routeMock} />
      </SafeAreaProvider>
    );

    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('registers a user successfully', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SafeAreaProvider>
        <RegistrationScreen navigation={navigationMock} route={routeMock} />
      </SafeAreaProvider>
    );
  
    // Fill out the form
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
  
    // Submit the form
    fireEvent.press(getByText('Sign Up'));

    // Wait for the snackbar to confirm registration success
    await waitFor(() => expect(getByText('Signup successful!')).toBeTruthy());    
  });
  
  
  it('succesfully navigates to the login screen when the "Already have an account? Sign in" text is pressed', () => {
    const { getByText } = render(
      <SafeAreaProvider>
        <RegistrationScreen navigation={navigationMock} route={routeMock} />
      </SafeAreaProvider> 
    );

    fireEvent.press(getByText('Sign In'));
    expect(navigationMock.navigate).toHaveBeenCalledWith('Login');
  });
});

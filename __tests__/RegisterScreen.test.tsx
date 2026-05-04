import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import RegistrationScreen from '../lib/screens/loginScreens/RegisterScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Insets = { top: number; bottom: number; left: number; right: number };
type SafeAreaConsumerProps = {
  children: (insets: Insets) => React.ReactNode;
};
type ProviderProps = {
  children?: React.ReactNode;
};
type ScrollViewProps = {
  children?: React.ReactNode;
};
type SnackbarProps = {
  children?: React.ReactNode;
  visible?: boolean;
  onDismiss?: () => void;
  duration?: number;
};

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../lib/config/auth', () => ({
  AUTH_API_URL: 'https://example.com',
  authFetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: async () => '',
      json: async () => ({}),
    })
  ),
}));

//mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: ProviderProps) => children,
    SafeAreaConsumer: ({ children }: SafeAreaConsumerProps) => children({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    KeyboardAwareScrollView: ({ children }: ScrollViewProps) => <View>{children}</View>,
  };
});

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Snackbar: ({ children, visible, onDismiss, duration = 1500 }: SnackbarProps) => {
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

beforeEach(() => {
  mockReplace.mockClear();
});

describe('RegisterScreen', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <SafeAreaProvider>
        <RegistrationScreen />
      </SafeAreaProvider>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders input fields', () => {
    const { getByPlaceholderText } = render(
      <SafeAreaProvider>
        <RegistrationScreen />
      </SafeAreaProvider>
    );

    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('succesfully navigates to the login screen when the "Already have an account? Sign in" text is pressed', () => {
    const { getByText } = render(
      <SafeAreaProvider>
        <RegistrationScreen />
      </SafeAreaProvider>
    );

    fireEvent.press(getByText('Sign In'));
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });
});

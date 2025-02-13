import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RegistrationScreen from '../lib/screens/loginScreens/RegisterScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock store
const mockStore = configureStore([]);
const store = mockStore({
  auth: { user: null }, // Ensure user is logged out
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
      KeyboardAwareScrollView: (props) => <View {...props}>{props.children}</View>,
    };
  });  

jest.mock("firebase/database", () => ({
    getDatabase: jest.fn(), // Mock getDatabase to prevent the error
  }));
  
  //mock logged out user
  jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
    onAuthStateChanged: jest.fn(), // Mock onAuthStateChanged
  }));

describe('RegisterScreen', () => {
    const navigationMock = { navigate: jest.fn() }; // Mock navigation prop
    const routeMock = { params: {} }; // Mock route prop
    it('renders correctly', () => {
        const { toJSON } = render(
            <Provider store={store}>
                <SafeAreaProvider>
                    <RegistrationScreen navigation={navigationMock} route={routeMock} />
                </SafeAreaProvider>
            </Provider>
        );
        expect(toJSON()).toMatchSnapshot();
    });
});    
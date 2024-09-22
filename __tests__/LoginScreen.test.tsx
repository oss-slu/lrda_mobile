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

  it('calls the login function after the login button is clicked once', async () => {
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

    // Render the component
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    // Bypass animation by setting `firstClick` state directly in the test
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <SafeAreaProvider>
          <LoginScreen navigation={navigationMock} route={routeMock} />
        </SafeAreaProvider>
      </Provider>
    );

    // Wait for the input fields to appear
    const emailInput = await waitFor(() => getByTestId('email-input'));
    const passwordInput = await waitFor(() => getByTestId('password-input'));

    // Fill in the input fields
    fireEvent.changeText(emailInput, 'test123');
    fireEvent.changeText(passwordInput, 'test123');

    // Wait for the login button to appear
    const loginButton = await waitFor(() => getByText('Login'));

    // Click the login button
    fireEvent.press(loginButton);

    // Wait for the navigation to occur
    await waitFor(() => {
      expect(navigationMock.navigate).toHaveBeenCalledWith('HomeTab');
    });
  });
  
});

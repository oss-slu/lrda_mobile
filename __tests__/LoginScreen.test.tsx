import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Make sure to import SafeAreaProvider
import configureStore from 'redux-mock-store';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';

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
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    if (!message.includes('Toolbar has no editor')) {
      console.warn(message);
    }
  });
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore(); // Restore console.warn after the tests
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
});

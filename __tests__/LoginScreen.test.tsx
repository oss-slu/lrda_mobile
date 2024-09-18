import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Make sure to import SafeAreaProvider
import configureStore from 'redux-mock-store';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';
import moxios from 'moxios'
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
<<<<<<< bug/login-button-issue

  it("triggers login function when login button is pressed while keyboard is mounted", () => {
    // Mock the login function prop
    const mockLoginFunction = jest.fn();

    // Pass the mockLoginFunction as the login prop to the LoginScreen component
    const wrapper = shallow(<LoginScreen login={mockLoginFunction} />);

    // Simulate user input in username and password fields
    wrapper.find('TextInput[placeholder="Username"]').simulate('changeText', 'testuser');
    wrapper.find('TextInput[placeholder="Password"]').simulate('changeText', 'password123');

    wrapper.find('TouchableOpacity').simulate('press');

    // Assert that the login function was called
    expect(mockLoginFunction).toHaveBeenCalled();
  });
});
=======
});
>>>>>>> main

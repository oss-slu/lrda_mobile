import React from 'react';
import { shallow } from 'enzyme';
import MorePage from '../lib/screens/MorePage';
import moxios from 'moxios';
import { User } from '../lib/models/user_class';
import { Linking } from 'react-native';
import { ThemeProvider, useTheme } from '../lib/components/ThemeProvider';
import ThemeProviderMock from './ThemeProviderMock';

// Mock the ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

// Mock the User class
jest.mock('../lib/models/user_class', () => {
  return {
    User: {
      getInstance: jest.fn(() => ({
        logout: jest.fn(),
      })),
    },
  };
});

beforeAll(() => {
  // Suppress console logs during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Install moxios for mocking HTTP requests
  moxios.install();
});

// This will restore the original console methods and uninstall moxios after all tests are done
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
});

describe("MorePage", () => {
  it("renders correctly", () => {
    const wrapper = shallow(<MorePage />);
    expect(wrapper).toMatchSnapshot();
  });

  it("toggles dark mode correctly", () => {
    const wrapper = shallow(<MorePage />);

    const toggleButton = wrapper.findWhere((node) => node.key() === "Switch");

    // Check if the onValueChange prop exists
    expect(toggleButton.props().onValueChange).toBeDefined();
  });

  it("opens email link when 'Report a Bug' is pressed", () => {
    const spy = jest.spyOn(Linking, 'openURL');
    const wrapper = shallow(<MorePage />);
    const emailButton = wrapper.findWhere((node) => node.key() === "Email");

    emailButton.simulate('press');

    expect(spy).toHaveBeenCalledWith(
      "mailto:yashkamal.bhatia@slu.edu?subject=Bug%20Report%20on%20'Where's%20Religion%3F'&body=Please%20provide%20details%20of%20your%20issue%20you%20are%20facing%20here."
    );
  });

});

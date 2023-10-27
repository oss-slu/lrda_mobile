import React from 'react';
import { shallow } from 'enzyme';
import MorePage from '../lib/screens/MorePage.tsx';
import moxios from 'moxios';

// Configure the manual mock for @gapur/react-native-accordion
jest.mock('@gapur/react-native-accordion');

// Mock the ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

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
});



/*
    it("toggles dark mode correctly", () => {
        const wrapper = shallow(<MorePage />);
        const toggleButton = wrapper.find('Switch');
        
        expect(wrapper.state().isDarkMode).toBe(false);
        
        toggleButton.simulate('valueChange', true);
        
        expect(wrapper.state().isDarkMode).toBe(true);
        expect(wrapper.instance().handleToggleDarkMode).toHaveBeenCalled();
    });

    it("opens email link when 'Report a Bug' is pressed", () => {
        const spy = jest.spyOn(Linking, 'openURL');
        const wrapper = shallow(<MorePage />);
        const emailButton = wrapper.findWhere((node) => node.prop('title') === "Report a Bug");

        emailButton.simulate('press');

        expect(spy).toHaveBeenCalledWith(
        'mailto:yashkamal.bhatia@slu.edu?subject=Bug Report on Where\'s Religion?&body=Please provide details of your issue you are facing here.'
        );
    });

    it("calls the logout function when 'Logout' is pressed", () => {
        const spy = jest.spyOn(User.getInstance(), 'logout');
        const wrapper = shallow(<MorePage />);
        const logoutButton = wrapper.findWhere((node) => node.prop('title') === "Logout");

        logoutButton.simulate('press');

        expect(spy).toHaveBeenCalled();
    });
    */
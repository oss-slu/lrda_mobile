import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native'; // Added NavigationContainer
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';
import { Linking } from 'react-native';
import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('react-native/Libraries/Image/Image', () => ({
  ...jest.requireActual('react-native/Libraries/Image/Image'),
  resolveAssetSource: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
}));

jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
}));

//mock carousel
jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => <View>{props.children}</View>;
});

const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'more',
  },
  theme: {
    darkMode: false,
  },
});

const mockToggleDarkmode = jest.fn();
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      primaryColor: '#ffffff',
      text: '#000000',
      secondaryColor: '#f0f0f0',
      logout: '#ff0000',
      logoutText: '#ffffff',
      homeColor: '#abcdef',
      black: '#000000',
    },
    isDarkmode: false,
    toggleDarkmode: mockToggleDarkmode,
  })),
}));

jest.mock('../lib/models/user_class', () => {
  return {
    User: {
      getInstance: jest.fn(() => ({
        getName: jest.fn(() => Promise.resolve("John Doe")),
        logout: jest.fn(() => Promise.resolve()),
        userData: { name: "John Doe" },
      })),
    },
  };
});



jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('MorePage - Main View', () => {
  it('should render MorePage view with header and main menu items', async () => {
    const {getByText} = render(
        <Provider store={store}>
          <NavigationContainer>
            <MorePage/>
          </NavigationContainer>
        </Provider>
    );

    await waitFor(() => {
      expect(getByText('JD')).toBeTruthy(); // "John Doe" -> initials "JD"
    });

    expect(getByText('More')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
    expect(getByText('Resource')).toBeTruthy();
    expect(getByText('Meet our team')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('FAQ')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('should call logout when the Logout menu item is pressed', async () => {
    const {getByText} = render(
        <Provider store={store}>
          <NavigationContainer>
            <MorePage/>
          </NavigationContainer>
        </Provider>
    );

    await waitFor(() => {
      expect(getByText('JD')).toBeTruthy();
    });

    const logoutBtn = getByText('Logout');
    fireEvent.press(logoutBtn);

    // Verify that the logout function on the User instance is called
    const {User} = require('../lib/models/user_class');
    expect(User.getInstance().logout).toHaveBeenCalled();
  });
});

  describe('MorePage - Settings View and Modals', () => {
    // Render the component and toggle into the settings view
    const renderAndOpenSettings = async () => {
      const utils = render(
          <Provider store={store}>
            <NavigationContainer>
              <MorePage />
            </NavigationContainer>
          </Provider>
      );
      // Wait for the main view to load (user initials appear)
      await waitFor(() => {
        expect(utils.getByText('JD')).toBeTruthy();
      });
      // Open settings view by pressing the "Settings" menu item
      const settingsBtn = utils.getByText('Settings');
      fireEvent.press(settingsBtn);
      // Now the settings header should be visible with "Settings" title
      await waitFor(() => {
        expect(utils.getByText('Settings')).toBeTruthy();
      });
      return utils;
    };

    it('should render the settings view with correct options', async () => {
      const { getByText } = await renderAndOpenSettings();

      // Check that settings options are visible
      expect(getByText('App Theme')).toBeTruthy();
      expect(getByText('Delete My Account')).toBeTruthy();
      expect(getByText('Report an Issue')).toBeTruthy();
    });

    it('should open the App Theme modal when App Theme option is pressed', async () => {
      const { getByText, queryByText } = await renderAndOpenSettings();

      // Initially, modal should not be visible
      expect(queryByText('Customize your app')).toBeNull();

      // Press the "App Theme" option
      const appThemeOption = getByText('App Theme');
      fireEvent.press(appThemeOption);

      // Modal should now be visible with the heading "Customize your app"
      await waitFor(() => {
        expect(getByText('Customize your app')).toBeTruthy();
      });
    });

    it('should open the Delete Account modal when Delete My Account is pressed', async () => {
      const { getByText, queryByText } = await renderAndOpenSettings();

      // Initially, delete account modal is not visible
      expect(queryByText('Are you sure you want to delete your account?')).toBeNull();

      // Press the "Delete My Account" option
      const deleteOption = getByText('Delete My Account');
      fireEvent.press(deleteOption);

      // Modal should now be visible with the confirmation question
      await waitFor(() => {
        expect(getByText('Are you sure you want to delete your account?')).toBeTruthy();
      });
    });

    it('should call Linking.openURL when Report an Issue is pressed', async () => {
      const { getByText } = await renderAndOpenSettings();

      // Press the "Report an Issue" option
      const reportIssueOption = getByText('Report an Issue');
      fireEvent.press(reportIssueOption);

      // Check that Linking.openURL was called with the correct mailto URL
      const expectedEmail = 'yashkamal.bhatia@slu.edu';
      const expectedSubject = encodeURIComponent("Bug Report on 'Where's Religion?");
      const expectedBody = encodeURIComponent('Please provide details of your issue you are facing here.');
      const expectedMailto = `mailto:${expectedEmail}?subject=${expectedSubject}&body=${expectedBody}`;

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(expectedMailto);
      });
    });
});

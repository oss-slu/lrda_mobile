import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native'; // Added NavigationContainer
import configureStore from 'redux-mock-store';
import MorePage from '../lib/screens/MorePage';
import { Linking, TouchableOpacity } from 'react-native';
import HomeScreen from '../lib/screens/HomeScreen';
import { waitFor } from '@testing-library/react-native';

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

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({
    id: 'mocked-doc-id',
  })),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ name: 'Mocked User' }),
    })
  ),
}));

//mock carousel
jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props, ref) => {
    // Disable autoPlay and animations to prevent act() warnings
    const { autoPlay, autoPlayInterval, scrollAnimationDuration, ...restProps } = props;
    return (
      <View testID="carousel" ref={ref} {...restProps}>
        {props.children}
      </View>
    );
  });
});

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
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

const mockUserInstance = {
  getName: jest.fn(() => Promise.resolve("John Doe")),
  logout: jest.fn(() => Promise.resolve()),
  userData: { name: "John Doe" },
};

jest.mock('../lib/models/user_class', () => ({
  User: {
    // Added mock for getHasDoneTutorial to simulate user has done the tutorial.
    getHasDoneTutorial: jest.fn(() => Promise.resolve(true)),
    // Always return the same mock instance
    getInstance: jest.fn(() => mockUserInstance)
  }
}));

jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

const mockStore = configureStore([]);
const store = mockStore({
  navigation: {
    navState: 'more',
  },
  theme: {
    darkMode: false,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('MorePage - Main View', () => {
  it('should render the carousel', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await act(async () => {
      await waitFor(() => {
        expect(component.getByTestId('carousel')).toBeTruthy();
      });
    });
  });

  it('should toggle dark mode when theme switch is pressed', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await act(async () => {
      const toggleSwitch = component.getByTestId('dark-mode-toggle');
      fireEvent.press(toggleSwitch);
    });
    
    expect(mockToggleDarkmode).toHaveBeenCalled();
  });

  it('should display user and navigate to AccountPage when avatar is pressed', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Wait until the asynchronous useEffect sets the initials
    await act(async () => {
      await waitFor(() => {
        expect(component.getByText('JD')).toBeTruthy();
      });
    });

    await act(async () => {
      fireEvent.press(component.getByText('JD'));
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("AccountPage");
  });

  it('should call logout when the Logout menu item is pressed', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Wait until the asynchronous useEffect sets the user initials
    await act(async () => {
      await waitFor(() => {
        expect(component.getByText('JD')).toBeTruthy();
      });
    });

    await act(async () => {
      const logoutBtn = component.getByText('Logout');
      fireEvent.press(logoutBtn);
    });

    // Wait for the asynchronous logout function to be called
    await act(async () => {
      await waitFor(() => {
        expect(mockUserInstance.logout).toHaveBeenCalled();
      });
    });
  });

  it('should navigate to Resource page when Resource menu item is pressed', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );

    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      await waitFor(() => {
        expect(component.getByText('JD')).toBeTruthy();
      });
    });

    await act(async () => {
      const resourceBtn = component.getByText('Resource');
      fireEvent.press(resourceBtn);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("Resource");
  });

  it('should navigate to TeamPage when "Meet our team" menu item is pressed', async () => {
    const component = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      await waitFor(() => {
        expect(component.getByText('JD')).toBeTruthy();
      });
    });

    await act(async () => {
      const teamBtn = component.getByText('Meet our team');
      fireEvent.press(teamBtn);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("TeamPage");
  });
});

describe('MorePage - Settings View and Modals', () => {
  // Render the component
  const renderAndOpenSettings = async () => {
    const utils = render(
      <Provider store={store}>
        <NavigationContainer>
          <MorePage />
        </NavigationContainer>
      </Provider>
    );
    
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Wait for the main view to load
    await act(async () => {
      await waitFor(() => {
        expect(utils.getByText('JD')).toBeTruthy();
      });
    });
    
    // Open settings view by pressing the "Settings" menu item
    await act(async () => {
      const settingsBtn = utils.getByText('Settings');
      fireEvent.press(settingsBtn);
    });
    
    // Now settings header should be visible with "Settings" title
    await act(async () => {
      await waitFor(() => {
        expect(utils.getByText('Settings')).toBeTruthy();
      });
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
    expect(queryByText('Customize your app')).toBeNull();

    // Press the "App Theme" option
    await act(async () => {
      const appThemeOption = getByText('App Theme');
      fireEvent.press(appThemeOption);
    });

    // Modal should now be visible with the heading "Customize your app"
    await act(async () => {
      await waitFor(() => {
        expect(getByText('Customize your app')).toBeTruthy();
      });
    });
  });

  it('should call Linking.openURL when Report an Issue is pressed', async () => {
    const { getByText } = await renderAndOpenSettings();

    // Press the "Report an Issue" option
    await act(async () => {
      const reportIssueOption = getByText('Report an Issue');
      fireEvent.press(reportIssueOption);
    });

    // Check that Linking.openURL was called with the correct mailto URL
    const expectedEmail = 'yashkamal.bhatia@slu.edu';
    const expectedSubject = encodeURIComponent("Bug Report on 'Where's Religion?");
    const expectedBody = encodeURIComponent('Please provide details of your issue you are facing here.');
    const expectedMailto = `mailto:${expectedEmail}?subject=${expectedSubject}&body=${expectedBody}`;

    await act(async () => {
      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(expectedMailto);
      });
    });
  });

  it('should return to the main view when the back arrow in Settings is pressed', async () => {
    const { getByText, queryByTestId, UNSAFE_getAllByType } = await renderAndOpenSettings();

    // In settings view, the header shows "Settings"
    expect(getByText('Settings')).toBeTruthy();

    await act(async () => {
      const touchableComponents = UNSAFE_getAllByType(TouchableOpacity);
      // Assuming the first TouchableOpacity in settings header is the back arrow.
      const backArrowBtn = touchableComponents[0];
      fireEvent.press(backArrowBtn);
    });

    // After pressing back, the main view header ("More") should be visible.
    await act(async () => {
      await waitFor(() => {
        expect(getByText('More')).toBeTruthy();
        // And the Settings header should no longer be visible.
        expect(queryByTestId('settings-header')).toBeNull();
      });
    });
  });
});

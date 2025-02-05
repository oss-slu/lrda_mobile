import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Library from '../lib/screens/Library';
import { useTheme } from '../lib/components/ThemeProvider';
import ApiService from '../lib/utils/api_calls';
import ToastMessage from 'react-native-toast-message';
import { onAuthStateChanged } from 'firebase/auth';
import configureStore from 'redux-mock-store';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import moxios from 'moxios'
import { User } from '../lib/models/user_class';


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
      },
      isDarkmode: false,
      toggleDarkmode: mockToggleDarkmode,
    })),
  }));

  // Mock expo-location module with TypeScript type support
  jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(),
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
  }));
  

// Silence console warnings during the test
beforeEach(() => {
    jest.clearAllMocks();
  
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    moxios.install()
  });
  
  afterEach(() => {
    moxios.uninstall()
  });
  
describe('Library Component', () => {
  it('renders without crashing', async () => {
    const navigationMock = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
      };    
    const routeMock = { params: {} }; // Mock route prop
    const { getByTestId } = render(
            <Library navigation={navigationMock as any} route={routeMock as any} /> 
    );
    await waitFor(() => expect(getByTestId('Library')).toBeTruthy());
  });

  it('renders search bar', async () => {
    const navigationMock = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
      };    
    const routeMock = { params: {} }; // Mock route prop
    const { getByTestId } = render(
            <Library navigation={navigationMock as any} route={routeMock as any} /> 
    );
    await waitFor(() => expect(getByTestId('SearchBar')).toBeTruthy());
  });

  it('renders filter bar', async () => {
    const navigationMock = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
      };    
    const routeMock = { params: {} }; // Mock route prop
    const { getByTestId } = render(
            <Library navigation={navigationMock as any} route={routeMock as any} /> 
    );
    await waitFor(() => expect(getByTestId('Filter')).toBeTruthy());
  });

  it('renders the account icon (top left) and navigates to AccountPage when clicked', async () => {
    // Provide a navigation object with a navigate function
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    // Render the Library component with the mocked navigation
    const { getByTestId } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );

    // Wait for the account component to appear (using the testID we added)
    const accountComponent = await waitFor(() => getByTestId('account-page'));
    expect(accountComponent).toBeTruthy();

     // Simulate a press event on the account component
     fireEvent.press(accountComponent);

     // Assert that navigation.navigate was called with "AccountPage"
     expect(navigationMock.navigate).toHaveBeenCalledWith("AccountPage");

  });

  it('Toggles Search Bar and clicks it', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    // Optionally, mock the ApiService to avoid network calls
    jest.spyOn(ApiService, 'fetchMessages').mockResolvedValue([]);

    // Render the Library component
    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

    // Query the search icon button using its testID and simulate a press event.
    const searchButton = await waitFor(() => getByTestId('search-button'));
    fireEvent.press(searchButton);
    expect(searchButton).toBeTruthy();
  });
  
  it('renders the user name "Adem" regardless of the greeting', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    // Mock the asynchronous getName method to always return "Adem"
    const userInstance = User.getInstance();
    jest.spyOn(userInstance, 'getName').mockResolvedValue('Adem');

    const { getByText } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

    // Wait for the asynchronous update and check if "Adem" appears
    await waitFor(() => {
      expect(getByText(/Adem/)).toBeTruthy();
    });
  });

  it('shows the close button when the search bar is opened', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    // Optionally, mock the ApiService.fetchMessages to avoid network calls.
    jest.spyOn(ApiService, 'fetchMessages').mockResolvedValue([]);

    // Render the Library component.
    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

    // Query the search button using its testID.
    const searchButton = await waitFor(() => getByTestId('search-button'));
    expect(searchButton).toBeTruthy();

    // Simulate a press event on the search button.
    fireEvent.press(searchButton);

    // Now, wait for the close button (the X button) to appear.
    const closeButton = await waitFor(() => getByTestId('close-button'));
    expect(closeButton).toBeTruthy();
  });

  it('renders the "Library" title at the top', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    const { getByText } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

    await waitFor(() => {
      expect(getByText("Library")).toBeTruthy();
    });
  });

  it('renders the notes list', async () => {
    const navigationMock = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
      };    
    const routeMock = { params: {} }; // Mock route prop
    const { getByTestId } = render(
            <Library navigation={navigationMock as any} route={routeMock as any} /> 
    );
    await waitFor(() => expect(getByTestId('notes-list')).toBeTruthy());
  });

  it('renders the LottieView empty state when no notes are loaded', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    // Simulate an API call that returns an empty array (no notes)
    jest.spyOn(ApiService, 'fetchMessages').mockResolvedValue([]);

    // Render the Library component
    const { getByText } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );

    // Wait for the asynchronous update and verify that the empty state text is displayed
    await waitFor(() => {
      expect(getByText('No Results Found')).toBeTruthy();
    });
  });

});



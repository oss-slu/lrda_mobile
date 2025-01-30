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

});
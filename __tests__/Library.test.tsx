import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Library from '../lib/screens/Library';
import HomeScreen from '../lib/screens/HomeScreen';
import { useTheme } from '../lib/components/ThemeProvider';
import ApiService from '../lib/utils/api_calls';
import ToastMessage from 'react-native-toast-message';
import { onAuthStateChanged } from 'firebase/auth';
import configureStore from 'redux-mock-store';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import moxios from 'moxios';
import { User } from '../lib/models/user_class';

jest.mock('firebase/database', () => ({
    getDatabase: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})), 
  doc: jest.fn(() => ({})), 
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));


jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));

jest.mock('../lib/utils/data_conversion', () => {
  return {
    convertMediaTypes: (data: any[]) => {
      return data.map(message => ({
        ...message,
        // Ensure that the id is set from "@id" or fallback to message.id
        id: message["@id"] || message.id,
        title: message.title || "",
        text: message.BodyText || "",
        time: message.time || (message.__rerum && message.__rerum.createdAt) || "",
        creator: message.creator || "",
        media: message.media || [],
        audio: message.audio || [],
        latitude: message.latitude || "",
        longitude: message.longitude || "",
        published: message.published || false,
        tags: message.tags || [],
      }));
    },
    // Pass through extractImages as-is.
    extractImages: jest.requireActual('../lib/utils/data_conversion').extractImages,
  };
});

jest.mock('../lib/components/NotesComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ item }: { item: any }) => {
    // Use @id if available, otherwise fall back to item.id
    const noteId = item["@id"] || item.id;
    return (
        <Text testID={`note-${noteId}`}>
          {item.title}
        </Text>
    );
  };
});
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
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  moxios.uninstall();
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
    const routeMock = { params: {} };
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
    const routeMock = { params: {} };
    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );
    await waitFor(() => expect(getByTestId('Filter')).toBeTruthy());
  });

  it('renders the account icon (top left) and navigates to AccountPage when clicked', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    const { getByTestId } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );

    const accountComponent = await waitFor(() => getByTestId('account-page'));
    expect(accountComponent).toBeTruthy();

    fireEvent.press(accountComponent);

    expect(navigationMock.navigate).toHaveBeenCalledWith("AccountPage");
  });

  it('Toggles Search Bar and clicks it', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    jest.spyOn(ApiService, 'fetchMessages').mockResolvedValue([]);

    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

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

    const userInstance = User.getInstance();
    jest.spyOn(userInstance, 'getName').mockResolvedValue('Adem');

    const { getByText } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

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

    jest.spyOn(ApiService, 'fetchMessages').mockResolvedValue([]);

    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );

    const searchButton = await waitFor(() => getByTestId('search-button'));
    expect(searchButton).toBeTruthy();

    fireEvent.press(searchButton);

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
    const routeMock = { params: {} };
    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );
    await waitFor(() => expect(getByTestId('notes-list')).toBeTruthy());
  });

  it('wishes the user', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };
    const { getByTestId } = render(
      <Library navigation={navigationMock as any} route={routeMock as any} />
    );
    await waitFor(() => expect(getByTestId('greeting-component')).toBeTruthy());
  });

  it('renders the LottieView empty state when no notes are loaded', async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    jest.spyOn(ApiService, 'fetchMessagesBatch').mockResolvedValue([]);

    const { getByText } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );

    await waitFor(() => {
      expect(getByText('No Results Found')).toBeTruthy();
    });
  });

  
  it("Renders no results found when there are no more notes.", async () => {

    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };

    jest.spyOn(ApiService, 'fetchMessagesBatch').mockResolvedValue([]);

    const { getByText } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );

    await waitFor(() => {
      expect(getByText('No Results Found')).toBeTruthy();
    });


  });
  it("Renders the Load More button", async () => {
    const navigationMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
    };
    const routeMock = { params: {} };
  
    const dummyNotes = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      time: new Date().toISOString(),
      title: `Test Note ${i}`,
      text: "Test note text",
      published: true,
      isArchived: false,
      media: [
        {
          getType: () => "image",
          getUri: () => "https://dummyimage.com/100x100",
          getThumbnail: () => "https://dummyimage.com/100x100",
        },
      ],
    }));
  
    jest.spyOn(ApiService, 'fetchMessagesBatch').mockResolvedValue(dummyNotes);
  
    const { getByText } = render(
      <Library navigation={navigationMock} route={routeMock} />
    );
  
    await waitFor(() => {
      expect(getByText("Load More")).toBeTruthy();
    });
  });
});


// __tests__/ExplorePage.test.tsx

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import ExploreScreen from '../lib/screens/mapPage/ExploreScreen';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import ApiService from '../lib/utils/api_calls';

// Get screen width for scroll simulation
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: { text: '#000000', homeColor: '#ffffff' },
    isDarkmode: false,
  }),
}));

jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((_, callback) =>
    callback({ uid: "12345", email: "test@example.com" })
  ),
}));
jest.mock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
jest.mock("firebase/database", () => ({ getDatabase: jest.fn() }));
jest.mock("firebase/storage", () => ({ getStorage: jest.fn() }));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({ settings: {} })),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } })
  ),
}));

jest.mock('../lib/utils/api_calls', () => {
  const dummyNotes = Array.from({ length: 20 }, (_, index) => ({
    latitude: '38.631393',
    longitude: '-90.192226',
    creator: 'User',
    __rerum: { createdAt: new Date().toISOString() },
    title: `Note ${index}`,
    BodyText: 'Description',
    media: [],
    tags: [],
  }));
  return {
    writeNewNote: jest.fn(),
    fetchMessages: jest.fn(() => Promise.resolve([])),
    fetchMessagesBatch: jest.fn(() => Promise.resolve(dummyNotes)),
    fetchMapsMessagesBatch: jest.fn(() => Promise.resolve(dummyNotes)),
  };
});

describe('ExploreScreen - Load More Button Rendering', () => {
  it('renders Explore screen', async () => {
    const { getByTestId } = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    const explore = await waitFor(() => getByTestId('Explore'));
    expect(explore).toBeTruthy();
  });

  it('shows Load More button after scrolling to the last card', async () => {
    const { getByTestId, getByText } = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    const scrollView = await waitFor(() => getByTestId('cardScrollView'));

    // Simulate scroll to 20th card (index 19) — enough to satisfy currentIndex >= page * LIMIT - 1
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: {
          x: (CARD_WIDTH + 20) * 19,
        },
      },
    });

    await waitFor(() => {
      expect(getByTestId('loadMoreButton')).toBeTruthy();
    });
  });

  it('calls fetchMapsMessagesBatch when Load More is pressed', async () => {
    const { getByTestId, getByText } = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    const scrollView = await waitFor(() => getByTestId('cardScrollView'));

    // Scroll to simulate user reaching the end of the scroll view
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: {
          x: (CARD_WIDTH + 20) * 19,
        },
      },
    });

    const loadMoreButton = await waitFor(() => getByText('Load More'));
    fireEvent.press(loadMoreButton);

    await waitFor(() => {
      expect(ApiService.fetchMapsMessagesBatch).toHaveBeenCalledTimes(2);
    });
  });
});

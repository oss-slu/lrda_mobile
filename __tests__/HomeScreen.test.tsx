import React from 'react';
import { Text } from "react-native";
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../lib/screens/HomeScreen';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import { onAuthStateChanged } from 'firebase/auth';
import ApiService from '../lib/utils/api_calls';

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme',
  }),
}));

// Mock Firebase services
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
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

jest.mock('../lib/components/NotesComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ item }: { item: any }) => (
      <Text testID={`note-${item["@id"]}`}>
        {item.title}
      </Text>
  );
});



onAuthStateChanged.mockImplementation((auth, callback) => {
  const mockUser = { uid: "12345", email: "test@example.com" };
  callback(mockUser);
});

// Mock expo-location module
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock API calls
const mockWriteNewNote = jest.fn();
jest.mock('../lib/utils/api_calls', () => ({
  writeNewNote: mockWriteNewNote,
  fetchMessages: jest.fn(() => Promise.resolve([])),
  fetchMessagesBatch: jest.fn(() => Promise.resolve([])),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('HomeScreen', () => {
  it('renders HomeScreen', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the HomeScreen to be rendered
    const homeScreen = await waitFor(() => getByTestId('HomeScreen'));
    expect(homeScreen).toBeTruthy();
  });

  it('renders toggle search bar', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the toggle button to be rendered
    const toggleButton = await waitFor(() => getByTestId('searchButton'));
    expect(toggleButton).toBeTruthy();

    // Simulate pressing the toggle button
    fireEvent.press(toggleButton);

    // Check if the search bar is rendered
    const searchBar = await waitFor(() => getByTestId('search-input'));
    expect(searchBar).toBeTruthy();
  });

  it('renders sort button', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the sort button to be rendered
    const sortButton = await waitFor(() => getByTestId('sort-button'));
    expect(sortButton).toBeTruthy();
  });

  it('shows sort options', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );
  
    // Wait for the sort button to be rendered
    const sortButton = await waitFor(() => getByTestId('sort-button'));
    
    // Simulate pressing the sort button
    fireEvent.press(sortButton);
  
    // Check if the sort options are rendered
    const sortOptions = await waitFor(() => getByTestId('sort-options'));
    expect(sortOptions).toBeTruthy();
  });

  it('toggles private notes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the toggle button to be rendered
    const togglePrivateNotesButton = await waitFor(() => getByTestId('private-btn'));

    // Simulate pressing the toggle button and check if it is rendered
    fireEvent.press(togglePrivateNotesButton);
    expect(togglePrivateNotesButton).toBeTruthy();
  }
  );

  it('toggles public notes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the toggle button to be rendered
    const togglePublicNotesButton = await waitFor(() => getByTestId('public-btn'));

    // Simulate pressing the toggle button and check if it is rendered
    fireEvent.press(togglePublicNotesButton);
    expect(togglePublicNotesButton).toBeTruthy();

  }
  );

  it('greets the user', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the greeting component to be rendered
    const greetingComponent = await waitFor(() => getByTestId('greeting-component'));
    expect(greetingComponent).toBeTruthy();
  });

  it('renders notes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    // Wait for the notes list to be rendered
    const notesList = await waitFor(() => getByTestId('notes-list'));
    expect(notesList).toBeTruthy();
  });

  it("renders the account component and navigates to AccountPage when clicked", async () => {
    const mockNavigate = jest.fn();  // Mock navigation function
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} navigation={{ navigate: mockNavigate } as any} showTooltip={false} />
      </AddNoteProvider>
    );
  
    // Find the account button
    const accountComponent = await waitFor(() => getByTestId("user-account"));
    expect(accountComponent).toBeTruthy();
  
    // Simulate pressing the button
    fireEvent.press(accountComponent);
  
    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith("AccountPage");
  });

  it("handles and renders the 'Notes' title next to the account component", async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByText } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );
  
    // Wait for "Notes" title to appear
    await waitFor(() => {
      expect(getByText("Notes")).toBeTruthy();
    });
  });

  it("renders a Lottie animation when there are no notes found", async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    // Mock the API call to return an empty array (No notes found)
    jest.spyOn(ApiService, "fetchMessages").mockResolvedValueOnce([]);
  
    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );
  
    //Ensure the API call was triggered
    await waitFor(() => {
      expect(ApiService.fetchMessagesBatch).toHaveBeenCalled();
    });
  
    //Ensure the Lottie animation appears
    await waitFor(() => {
      expect(getByTestId("no-results-animation")).toBeTruthy();
    });
  });

  it("loads additional notes on scroll (batch rendering)", async () => {
    // Prepare two batches: 20 notes for the first batch and 10 for the second batch.
    const now = new Date().toISOString();
    const mockBatch1 = Array.from({ length: 20 }, (_, i) => ({
      "@id": `note-${i + 1}`,
      title: `Note ${i + 1}`,
      BodyText: `Content for note ${i + 1}`,
      time: now,
      __rerum: { createdAt: now }, // Required by DataConversion
      creator: "12345",
      media: [],
      audio: [],
      latitude: "",
      longitude: "",
      published: false,
      tags: [],
    }));
    const mockBatch2 = Array.from({ length: 10 }, (_, i) => ({
      "@id": `note-${i + 21}`,
      title: `Note ${i + 21}`,
      BodyText: `Content for note ${i + 21}`,
      time: now,
      __rerum: { createdAt: now }, // Required by DataConversion
      creator: "12345",
      media: [],
      audio: [],
      latitude: "",
      longitude: "",
      published: false,
      tags: [],
    }));

    // Override the mocked implementation of fetchMessagesBatch.
    (ApiService.fetchMessagesBatch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(mockBatch1))
        .mockImplementationOnce(() => Promise.resolve(mockBatch2));

    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
    );

    // Wait for the initial batch (20 notes) to load.
    await waitFor(() => {
      // Use getByTestId to check for specific note items.
      expect(getByTestId("note-note-1")).toBeTruthy();
      expect(getByTestId("note-note-20")).toBeTruthy();
    }, { timeout: 5000 });

    // Get the SwipeListView using its testID and simulate a scroll event.
    const list = getByTestId("swipe-list");
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 1500 },
        layoutMeasurement: { height: 500 },
      },
    });

    // Wait for the second batch to load and verify that a note from the second batch is rendered.
    await waitFor(() => {
      expect(getByTestId("note-note-21")).toBeTruthy();
    }, { timeout: 5000 });

    // Ensure that the fetchMessagesBatch method was called twice (initial load + batch load).
    expect(ApiService.fetchMessagesBatch).toHaveBeenCalledTimes(2);
  });




});

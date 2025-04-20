import React from 'react';
import { Text } from "react-native";
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // Import for creating a mock store
import HomeScreen from '../lib/screens/HomeScreen';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import { onAuthStateChanged } from 'firebase/auth';
import ApiService from '../lib/utils/api_calls';
import DataConversion from "../lib/utils/data_conversion";

// Mock external dependencies
jest.mock ('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme',
  }),
}));

// Mock Firebase services (unchanged)
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
  fetchMessagesBatch: jest.fn(() => Promise.resolve([])),
}));

// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({}); // You can pass an initial state here if needed

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
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} navigation={undefined} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the HomeScreen to be rendered
    const homeScreen = await waitFor(() => getByTestId('HomeScreen'));
    expect(homeScreen).toBeTruthy();
  });

  it('renders toggle search bar', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} navigation={undefined} />
        </AddNoteProvider>
      </Provider>
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

  it("applies correct styles to the user name text", async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}>
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    const userNameText = await waitFor(() => getByTestId("user-name"));
    const styles = userNameText.props.style;

    expect(styles).toEqual(
      expect.objectContaining({
        textAlign: 'center',
        alignSelf: 'center',
      })
    );
  });


  it('renders sort button', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the sort button to be rendered
    const sortButton = await waitFor(() => getByTestId('sort-button'));
    expect(sortButton).toBeTruthy();
  });

  it('shows sort options', async () => {
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
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
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the toggle button to be rendered
    const togglePrivateNotesButton = await waitFor(() => getByTestId('private-btn'));

    // Simulate pressing the toggle button and check if it is rendered
    fireEvent.press(togglePrivateNotesButton);
    expect(togglePrivateNotesButton).toBeTruthy();
  });

  it('toggles public notes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the toggle button to be rendered
    const togglePublicNotesButton = await waitFor(() => getByTestId('public-btn'));

    // Simulate pressing the toggle button and check if it is rendered
    fireEvent.press(togglePublicNotesButton);
    expect(togglePublicNotesButton).toBeTruthy();
  });

  it('greets the user', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the greeting component to be rendered
    const greetingComponent = await waitFor(() => getByTestId('greeting-component'));
    expect(greetingComponent).toBeTruthy();
  });

  it('renders notes', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    // Wait for the notes list to be rendered
    const notesList = await waitFor(() => getByTestId('notes-list'));
    expect(notesList).toBeTruthy();
  });

  it("renders the account component and navigates to AccountPage when clicked", async () => {
    const mockNavigate = jest.fn();  // Mock navigation function
    const routeMock = { params: { untitledNumber: 1 } };
  
    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} navigation={{ navigate: mockNavigate } as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
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
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );
  
    // Wait for "Notes" title to appear
    await waitFor(() => {
      expect(getByText("Notes")).toBeTruthy();
    });
  });

  it("renders a Lottie animation when there are no notes found", async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    // Mock the API call to return an empty array (No notes found)
    jest.spyOn(ApiService, "fetchMessagesBatch").mockResolvedValueOnce([]);
  
    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );
  
    // Ensure the API call was triggered
    await waitFor(() => {
      expect(ApiService.fetchMessagesBatch).toHaveBeenCalled();
    });
  
    //Ensure the Lottie animation appears
    await waitFor(() => {
      expect(getByTestId("no-results-animation")).toBeTruthy();
    });
  });

  it(
      "loads additional notes on press of 'Load More' button (batch rendering)",
      async () => {
        const now = new Date().toISOString();
        const mockBatch1 = Array.from({ length: 20 }, (_, i) => ({
          "@id": `note-${i + 1}`,
          id: `note-${i + 1}`,
          title: `Note ${i + 1}`,
          BodyText: `Content for note ${i + 1}`,
          time: now,
          __rerum: { createdAt: now },
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
          id: `note-${i + 21}`,
          title: `Note ${i + 21}`,
          BodyText: `Content for note ${i + 21}`,
          time: now,
          __rerum: { createdAt: now },
          creator: "12345",
          media: [],
          audio: [],
          latitude: "",
          longitude: "",
          published: false,
          tags: [],
        }));

        (ApiService.fetchMessagesBatch as jest.Mock)
            .mockImplementationOnce(() => Promise.resolve(mockBatch1))
            .mockImplementationOnce(() => Promise.resolve(mockBatch2));

        const routeMock = { params: { untitledNumber: 1 } };

        const { getAllByTestId, findByTestId, findByText } = render(
            <AddNoteProvider>
              <HomeScreen route={routeMock as any} showTooltip={false} />
            </AddNoteProvider>
        );

        // wait for first note to render
        await findByTestId("note-note-1");

        const initialNotes = getAllByTestId(/^note-/);
        expect(initialNotes.length).toBe(20);

        const loadMoreButton = await findByText("Load More");
        expect(loadMoreButton).toBeTruthy();

        fireEvent.press(loadMoreButton);


        await waitFor(() => {
          const newNotes = getAllByTestId(/^note-/);
          expect(newNotes.length).toBeGreaterThan(initialNotes.length);
        });

        // check fetMessagesBatch gets called twice
        expect(ApiService.fetchMessagesBatch).toHaveBeenCalledTimes(2);
      },
      10000 // Increase overall timeout if needed.
  );

  it("renders 'No more notes.' message when all notes have been fetched", async () => {
    const now = new Date().toISOString();
    //create mock batch of notes
    const mockNotes = Array.from({ length: 10 }, (_, i) => ({
      "@id": `note-${i + 1}`,
      id: `note-${i + 1}`,
      title: `Note ${i + 1}`,
      BodyText: `Content for note ${i + 1}`,
      time: now,
      __rerum: { createdAt: now },
      creator: "12345",
      media: [],
      audio: [],
      latitude: "",
      longitude: "",
      published: false,
      tags: [],
    }));

    (ApiService.fetchMessagesBatch as jest.Mock).mockResolvedValueOnce(mockNotes);

    const routeMock = { params: { untitledNumber: 1 } };

    const { findByText } = render(
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
    );

    // wait for first note to render
    await findByText("Note 1");

    // check if footer shows "No more notes."
    const footerText = await findByText("No more notes.");
    expect(footerText).toBeTruthy();
  });




});






  it("applies the default font style to the 'Notes' title", async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByText } = render(
      <Provider store={store}>
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );

    const notesText = await waitFor(() => getByText("Notes"));

    // Safely flatten the style
    const flattenedStyle = Array.isArray(notesText.props.style)
      ? Object.assign({}, ...notesText.props.style)
      : notesText.props.style;

    expect(flattenedStyle.fontFamily).toBe("Inter"); // Update this as needed based on your globalStyles file
  });

});
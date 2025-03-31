import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // Import for creating a mock store
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
    jest.spyOn(ApiService, "fetchMessages").mockResolvedValueOnce([]);
  
    const { getByTestId } = render(
      <Provider store={store}> {/* Wrap with Provider */}
        <AddNoteProvider>
          <HomeScreen route={routeMock as any} showTooltip={false} />
        </AddNoteProvider>
      </Provider>
    );
  
    // Ensure the API call was triggered
    await waitFor(() => {
      expect(ApiService.fetchMessages).toHaveBeenCalled();
    });
  
    // Ensure the Lottie animation appears
    await waitFor(() => {
      expect(getByTestId("no-results-animation")).toBeTruthy();
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
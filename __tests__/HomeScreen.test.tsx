import React from 'react';
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


jest.mock("../lib/utils/api_calls", () => ({
  default: {
    fetchMessages: jest.fn().mockResolvedValue([]),
  },
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

    const toggleButton = await waitFor(() => getByTestId('searchButton'));
    expect(toggleButton).toBeTruthy();

    fireEvent.press(toggleButton);

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
  
    const sortButton = await waitFor(() => getByTestId('sort-button'));
    
    fireEvent.press(sortButton);
  
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

    const togglePrivateNotesButton = await waitFor(() => getByTestId('private-btn'));
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

    const togglePublicNotesButton = await waitFor(() => getByTestId('public-btn'));
    fireEvent.press(togglePublicNotesButton);
    expect(togglePublicNotesButton).toBeTruthy();

  }
  );

  //greeting component test
  it('renders greeting component', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

    const greetingComponent = await waitFor(() => getByTestId('greeting-component'));
    expect(greetingComponent).toBeTruthy();
  });

  it('renders notes list', async () => {
    const routeMock = { params: { untitledNumber: 1 } };

    const { getByTestId } = render(
      <AddNoteProvider>
        <HomeScreen route={routeMock as any} showTooltip={false} />
      </AddNoteProvider>
    );

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
  
    // Find the account button (ensure testID is set in HomeScreen.tsx)
    const accountComponent = await waitFor(() => getByTestId("user-account"));
    expect(accountComponent).toBeTruthy();
  
    // Simulate pressing the button
    fireEvent.press(accountComponent);
  
    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith("AccountPage");
  });

  it("renders the 'Notes' title next to the account component", async () => {
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
  
});

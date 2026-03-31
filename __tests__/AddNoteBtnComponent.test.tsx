import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddNoteBtnComponent from '../lib/components/AddNoteBtnComponent';

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/Feather',    () => 'Feather');
jest.mock('expo-font', () => ({
  isLoaded:  () => true,
  loadAsync: jest.fn(),
  memory:    { loadedNativeFonts: [] },
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation((sel) =>
    sel({
      themeSlice:   { theme: 'blue' },
      addNoteState: { isAddNoteOpned: false },
    })
  ),
  useDispatch: () => jest.fn(),
}));

let mockPathname = '/';
jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

const mockNavigateToAddNote = jest.fn();
const mockPublishNote       = jest.fn();

jest.mock('../lib/context/AddNoteContext', () => ({
  useAddNoteContext: () => ({
    navigateToAddNote:    mockNavigateToAddNote,
    setNavigateToAddNote: jest.fn(),
    publishNote:          mockPublishNote,
    setPublishNote:       jest.fn(),
  }),
}));

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme:      { primaryColor: 'blue' },
    isDarkmode: false,
  }),
}));

describe('AddNoteBtnComponent', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    mockPathname = '/';
    const { getByTestId } = render(<AddNoteBtnComponent />);
    expect(getByTestId('fab-button')).toBeTruthy();
  });

  it('shows Add and calls navigateToAddNote on Home', () => {
    mockPathname = '/';
    const { getByTestId, queryByTestId } = render(<AddNoteBtnComponent />);

    expect(getByTestId('add-icon')).toBeTruthy();
    expect(queryByTestId('publish-icon')).toBeNull();

    fireEvent.press(getByTestId('fab-button'));

    expect(mockNavigateToAddNote).toHaveBeenCalled();
  });

  it('shows Publish and calls publishNote on EditNote', () => {
    mockPathname = '/edit-note';
    const { getByTestId, queryByTestId } = render(<AddNoteBtnComponent />);

    expect(getByTestId('publish-icon')).toBeTruthy();
    expect(queryByTestId('add-icon')).toBeNull();

    fireEvent.press(getByTestId('fab-button'));
    expect(mockPublishNote).toHaveBeenCalled();
  });
});

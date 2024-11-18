import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TagWindow from '../lib/components/tagging';


jest.mock('../lib/utils/api_calls', () => ({
  fetchCreatorName: jest.fn(() => Promise.resolve([])),
}));


beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();

  // Mock console methods to avoid unnecessary log outputs in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console methods
  console.log.mockRestore();
  console.error.mockRestore();
});

jest.mock('@10play/tentap-editor', () => ({
  RichText: () => null,
  Toolbar: () => null,
  useEditorBridge: jest.fn(() => ({
    getHTML: jest.fn(() => ''),
    commands: {
      setContent: jest.fn(),
      focus: jest.fn(),
    },
  })),
}));

describe('TagWindowTest1', () => {
  const mockTags = ['Tag1', 'Tag2', 'Tag3'];
  const mockSetTags = jest.fn();

  it('renders without crashing', () => {
    const { toJSON } = render(<TagWindow tags={mockTags} setTags={mockSetTags} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays input field and tags list', () => {
    const { getByTestId, getAllByText } = render(<TagWindow tags={mockTags} setTags={mockSetTags} />);
    
    // Check if the input field exists
    expect(getByTestId('tag-input')).toBeTruthy();

    // Check if tags are displayed
    mockTags.forEach(tag => {
      expect(getAllByText(tag).length).toBeGreaterThan(0);
    });
  });
});

describe('TagWindowTest2', () => {
  const mockTags = ['Tag1', 'Tag2', 'Tag3'];
  const mockSetTags = jest.fn();

  it('handles tag deletion when swiping', async () => {
    const { getByTestId, getAllByText } = render(<TagWindow tags={mockTags} setTags={mockSetTags} />);

    // Simulate a swipe to delete the first tag
    const swipeListView = getByTestId('swipe-list');

    // Trigger row open, simulating a swipe to delete the first tag (Tag1)
    fireEvent(swipeListView, 'onRowOpen', '0');

    // Wait for the mockSetTags to be called with the updated tags
    await waitFor(() => {
      expect(mockSetTags).toHaveBeenCalledWith(['Tag2', 'Tag3']);
    });
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImageModal from '../lib/screens/mapPage/ImageModal';

// Mock ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      text: '#000',
    },
  }),
}));

beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();

  // Mock console methods to avoid unnecessary log outputs in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() =>{});
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    if (!message.includes('Toolbar has no editor')) {
      console.warn(message);
    }
  });
});

afterEach(() => {
  // Restore the original console methods
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
});

describe('ImageModal', () => {
  const mockImages = [
    { uri: 'https://example.com/image1.jpg' },
    { uri: 'https://example.com/image2.jpg' },
  ];

  it('renders without crashing', () => {
    const { toJSON } = render(<ImageModal isVisible={true} onClose={() => {}} images={mockImages} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays the correct number of images', () => {
    const { getAllByTestId } = render(<ImageModal isVisible={true} onClose={() => {}} images={mockImages} />);
    const images = getAllByTestId('image-component'); // Assuming each Image component has a testID 'image-component'
    expect(images.length).toBe(1);
  });

  it('handles the close button press', () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(<ImageModal isVisible={true} onClose={mockOnClose} images={mockImages} />);
    const closeButton = getByTestId('close-button'); // Assuming the TouchableOpacity has testID 'close-button'
    
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});

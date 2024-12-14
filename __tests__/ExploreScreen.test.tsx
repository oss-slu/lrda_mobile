import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ExploreScreen from '../lib/screens/mapPage/ExploreScreen';
import * as ApiService from '../lib/utils/api_calls';

// Mock ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
    useTheme: jest.fn(() => ({
      isDarkmode: false,
      theme: { text: 'black', background: 'white' },
      toggleDarkmode: jest.fn(),
    })),
  }));
  
  // Mock API service
  jest.mock('../lib/utils/api_calls', () => ({
    fetchMessages: jest.fn(),
  }));

describe('ExploreScreen - Map Pins', () => {
  it('should place pins at the correct coordinates based on note data', async () => {
    const mockNotes = [
      { latitude: '37.7749', longitude: '-122.4194', title: 'Note 1' },
      { latitude: '34.0522', longitude: '-118.2437', title: 'Note 2' },
    ];

    ApiService.fetchMessages.mockResolvedValue(mockNotes);

    const { queryAllByTestId } = render(<ExploreScreen />);
    await waitFor(() => {
      const markers = queryAllByTestId(/marker-/);
      expect(markers).toHaveLength(mockNotes.length);
      expect(markers[0].props.coordinate).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
    });
    expect(markers[1].props.coordinate).toEqual({
      latitude: 34.0522,
      longitude: -118.2437,
    });
  });
});

  it('should not create pins for notes with invalid coordinates', async () => {
    const mockNotes = [
      { latitude: 'invalid', longitude: '-122.4194', title: 'Invalid Note' },
      { latitude: '34.0522', longitude: '-118.2437', title: 'Valid Note' },
    ];

    ApiService.fetchMessages.mockResolvedValue(mockNotes);

    const { queryAllByTestId } = render(<ExploreScreen />);

    await waitFor(() => {
        const markers = queryAllByTestId(/marker-/);
        expect(markers).toHaveLength(1);
        expect(markers[0].props.coordinate).toEqual({
          latitude: 34.0522,
          longitude: -118.2437,
        });
      });
    });


    it('should update pins dynamically when new notes are fetched', async () => {
        const initialNotes = [
          { latitude: '40.7128', longitude: '-74.0060', title: 'Initial Note' },
        ];
        const newNotes = [
          { latitude: '37.7749', longitude: '-122.4194', title: 'New Note' },
        ];
      
        ApiService.fetchMessages
          .mockResolvedValueOnce(initialNotes)
          .mockResolvedValueOnce(newNotes);
      
        const { getByTestId, queryAllByTestId, rerender } = render(<ExploreScreen />);
      
        // Wait for initial notes
        await waitFor(() => {
          const markers = queryAllByTestId(/marker-/);
          expect(markers).toHaveLength(1);
          expect(markers[0].props.coordinate).toEqual({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        });
      
        // Simulate new fetch
        rerender(<ExploreScreen />);
        await waitFor(() => {
          const markers = queryAllByTestId(/marker-/);
          expect(markers).toHaveLength(1);
          expect(markers[0].props.coordinate).toEqual({
            latitude: 37.7749,
            longitude: -122.4194,
          });
        });
    });
    });
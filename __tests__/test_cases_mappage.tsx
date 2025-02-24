import { render } from '@testing-library/react-native';
import React from 'react';
import ExploreScreen from '../lib/screens/mapPage/ExploreScreen';

describe('ExploreScreen Map Marker Tests', () => {
  const mockMarkers = [
    {
      coordinate: {
        latitude: 40.712776,
        longitude: -74.005974,
      },
      title: 'Test Note 1',
    },
    {
      coordinate: {
        latitude: 34.052235,
        longitude: -118.243683,
      },
      title: 'Test Note 2',
    },
  ];

  it('renders markers with correct coordinates', () => {
    const { getByTestId } = render(<ExploreScreen marker={mockMarkers} />);

    mockMarkers.forEach((marker, index) => {
      const markerElement = getByTestId(`marker-${index}`);
      expect(markerElement.props.coordinate.latitude).toBe(marker.coordinate.latitude);
      expect(markerElement.props.coordinate.longitude).toBe(marker.coordinate.longitude);
    });
  });
});

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import React from 'react';
import { Alert } from 'react-native';
import ExploreScreen from '../lib/screens/mapPage/ExploreScreen';

jest.mock('../../components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      primaryColor: '#FFFFFF',
      text: '#000000',
    },
    isDarkmode: false,
  }),
}));

// Mocking Expo Location API
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe('ExploreScreen', () => {
  let component;

  beforeEach(() => {
    // Setting up permissions and mock location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 38.631393,
        longitude: -90.192226,
      },
    });
    component = render(<ExploreScreen />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = component;
    expect(toJSON()).toMatchSnapshot();
  });

  it('zooms into a cluster when clicked', async () => {
    const { getByTestId } = component;

    // Simulate cluster click
    const clusterMarker = getByTestId('cluster-marker');
    fireEvent.press(clusterMarker);

    // Verify map zoom effect by checking latitudeDelta (should be reduced)
    await waitFor(() => {
      const mapRegion = getByTestId('map-region');
      expect(mapRegion.props.latitudeDelta).toBeLessThan(0.04864195044303443);
    });
  });

  it('displays individual pins after zooming into a cluster', async () => {
    const { getByTestId, queryAllByTestId } = component;

    // Simulate cluster click
    const clusterMarker = getByTestId('cluster-marker');
    fireEvent.press(clusterMarker);

    // Check for presence of individual pins
    await waitFor(() => {
      const individualPins = queryAllByTestId('pin-marker');
      expect(individualPins.length).toBeGreaterThan(1);
    });
  });

  it('displays the correct note in the horizontal scrollbar when a pin is selected', async () => {
    const { getByTestId, queryByText } = component;

    // Simulate pin selection
    const pinMarker = getByTestId('pin-marker');
    fireEvent.press(pinMarker);

    // Wait and verify correct note displays in the scrollbar
    await waitFor(() => {
      const noteTitle = queryByText('Expected Note Title');
      expect(noteTitle).toBeTruthy();
    });
  });

  it('ensures the map type selector toggles correctly', () => {
    const { getByText } = component;

    // Open map type selector and select options
    fireEvent.press(getByText('Options'));

    const mapType2D = getByText('2D');
    fireEvent.press(mapType2D);
    expect(mapType2D).toHaveStyle({ fontWeight: 'bold' });

    const mapTypeSatellite = getByText('Satellite');
    fireEvent.press(mapTypeSatellite);
    expect(mapTypeSatellite).toHaveStyle({ fontWeight: 'bold' });
  });

  it('fetches messages correctly based on search query', async () => {
    const { getByText, getByPlaceholderText } = component;

    // Enter search query and submit
    const searchInput = getByPlaceholderText('Search here');
    fireEvent.changeText(searchInput, 'test search');
    fireEvent.press(getByText('Search'));

    // Verify expected result
    await waitFor(() => {
      const result = getByText('Expected Result Title');
      expect(result).toBeTruthy();
    });
  });

  it('handles location permission denial gracefully', async () => {
    // Set permissions to denied
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const alertSpy = jest.spyOn(Alert, 'alert');
    const { rerender } = component;

    rerender(<ExploreScreen />);

    // Confirm alert appears
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permission Denied',
        'Permission to access location was denied. This is required on this page',
        expect.any(Array)
      );
    });
  });

  it('handles null refs gracefully during marker and cluster clicks', async () => {
    const { queryByTestId } = component;

    // Attempt to press a marker without checking refs should not throw
    const pinMarker = queryByTestId('pin-marker');
    if (pinMarker) {
      fireEvent.press(pinMarker);
    }

    // Simulate a cluster press without refs
    const clusterMarker = queryByTestId('cluster-marker');
    if (clusterMarker) {
      fireEvent.press(clusterMarker);
    }

    // Verify no unhandled errors in the log
    expect(console.error).not.toHaveBeenCalled();
  });
});

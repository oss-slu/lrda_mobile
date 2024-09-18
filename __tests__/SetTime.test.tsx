import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LocationWindow from '../lib/components/time';
import { Button } from 'react-native';

// Mock ThemeProvider
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme',
  }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return (props) => <View testID={props.testID} />;
});

describe('LocationWindow', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<LocationWindow time={new Date()} setTime={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays the "Select Date & Time" button when not in edit mode', () => {
    const { getByText } = render(<LocationWindow time={new Date()} setTime={() => {}} />);

    // Verify that the "Select Date & Time" button is displayed
    const selectButton = getByText('Select Date & Time');
    expect(selectButton).toBeTruthy();
  });

  it('shows the "Save" button when date & time picker is active', () => {
    const { getByText, getByTestId } = render(
      <LocationWindow time={new Date()} setTime={() => {}} />
    );

    // Trigger the display of date & time pickers
    const selectButton = getByText('Select Date & Time');
    fireEvent.press(selectButton); // This should display the pickers

    // Now the "Save" button should be visible
    const saveButton = getByTestId('Save');
    expect(saveButton).toBeTruthy();

    // Simulate the button press
    fireEvent.press(saveButton);
  });
});

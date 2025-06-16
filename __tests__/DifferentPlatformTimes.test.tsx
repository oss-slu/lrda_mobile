import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import LocationWindow from "../lib/components/time";
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import moxios from 'moxios';

// Mock Redux store
const mockStore = configureStore([]);
const store = mockStore({});

// Mock external dependencies
jest.mock('../lib/components/ThemeProvider', () => ({
    useTheme: () => ({
        theme: 'mockedTheme', 
    }),
}));

jest.mock('../lib/utils/api_calls', () => ({
  fetchCreatorName: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const { View } = require("react-native");
    return (props: any) => <View testID={props.testID} />;
});

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (objs) => objs.ios,
}));


-beforeAll(() => {
  const { View } = require("react-native");
  return (props: any) => <View testID={props.testID} />;
});

+beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    moxios.install();
});
  
afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
    moxios.uninstall();
});

describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    const routeMock = {
      params: {
        untitledNumber: 1,
       refreshPage: jest.fn(),
     }
    };

    const navigationMock = {
      addListener: jest.fn(() => () => {}),
      canGoBack: () => false,
     goBack: jest.fn(),
    };

    const { getByTestId } = render(
      <Provider store={store}>
        <AddNoteScreen navigation={navigationMock} route={routeMock} />
      </Provider>
    );
    expect(getByTestId('TenTapEditor')).toBeTruthy();
  });
});

describe('LocationWindow (iOS)', () => {
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15); 

  beforeEach(() => {
      Platform.OS = 'ios'; // Set platform to iOS for this test suite
  });

  afterEach(() => {
      jest.resetModules(); 
      mockSetTime.mockClear(); 
  });

  it('displays the "Select Date & Time" button on iOS', () => {
    const { getByText } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText('Select Date & Time');
    expect(selectButton).toBeTruthy();
  });

  it('shows time picker when the button is clicked on iOS', async () => {
    const { getByText, queryByTestId } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    
    const selectButton = getByText('Select Date & Time');
    fireEvent.press(selectButton);

    await waitFor(() => {
      expect(queryByTestId('timePicker')).toBeTruthy(); // Assuming the picker has testID 'timePicker'
    });
  });
});

describe('LocationWindow (Android)', () => {
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15); 

  beforeEach(() => {
    Platform.OS = 'android'; // Set platform to Android
  });

  afterEach(() => {
    jest.resetModules(); 
    mockSetTime.mockClear(); 
  });

  it('displays the "Select Date & Time" button on Android', () => {
    const { getByText } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    const selectButton = getByText(/Select Date & Time/i);
    expect(selectButton).toBeTruthy();
  });

  it('shows time picker when the button is clicked on Android', async () => {
    const { getByText, queryByTestId } = render(<LocationWindow time={mockTime} setTime={mockSetTime} />);
    
    const selectButton = getByText('SELECT DATE & TIME');
    fireEvent.press(selectButton);

    await waitFor(() => {
      expect(queryByTestId('timePicker')).toBeTruthy(); // Assuming the picker has testID 'timePicker'
    });
  });
});

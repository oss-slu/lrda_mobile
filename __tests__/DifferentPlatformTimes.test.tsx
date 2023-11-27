import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
import { Button } from 'react-native';
import React from 'react';
import moxios from 'moxios';
import LocationWindow from "../lib/components/time";
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
});

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', 
  }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockDateTimePicker = ({ testID }) => (
    <View testID={testID}>DateTimePicker</View>
  );
  return MockDateTimePicker;
});


describe("AddNoteScreen", () => {
  const mockSetTime = jest.fn();
  it("renders without crashing", () => {
      const wrapper = shallow(<AddNoteScreen />);
      expect(wrapper).toMatchSnapshot();
  });
});

describe('LocationWindow', () => {
  const mockSetTime = jest.fn();
  const renderComponent = (platform) => {
    Platform.OS = platform;
    return shallow(<LocationWindow time={new Date()} setTime={mockSetTime} />);
  };

  describe('on iOS', () => {
    it('renders date and time picker correctly on iOS', () => {
      const wrapper = renderComponent('ios');
      expect(wrapper.find(DateTimePicker).length).toBe(0);
    });


  });


});
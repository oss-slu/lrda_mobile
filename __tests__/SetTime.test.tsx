import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { Button } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';
import LocationWindow from "../lib/components/time";


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

  jest.mock("@react-native-community/datetimepicker", () => {
    const { View } = require("react-native");
    return (props) => <View testID={props.testID} />;
  });
  
  
  describe("AddNoteScreen", () => {
    it("renders without crashing", () => {
        const wrapper = shallow(<AddNoteScreen />);
        expect(wrapper).toMatchSnapshot();
    });
  });


  describe('LocationWindow', () => {
    it('renders without crashing', () => {
      const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} />);
      expect(wrapper).toMatchSnapshot();
    });
  
    it('displays the "Select Date & Time" button when not in edit mode', () => {
      const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} />);
      const selectButton = wrapper.find(Button);
      expect(selectButton.prop('title')).toBe('Select Date & Time');
    });
  
    it('does not display the "Save" button when in edit mode', () => {
        const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} showPicker={true} />);
        const saveButton = wrapper.find(Button);
        expect(saveButton.exists()).toBe(true);
      });
  });
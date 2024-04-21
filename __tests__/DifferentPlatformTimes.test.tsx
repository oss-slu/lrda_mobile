import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { Button, Platform } from 'react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';
import LocationWindow from "../lib/components/time";

Enzyme.configure({ adapter: new Adapter() });

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

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios', // Default to iOS
    select: jest.fn(),
}));

describe("AddNoteScreen", () => {
    it("renders without crashing", () => {
      const routeMock = {
        params: {
          untitledNumber: 1
        }
      };
        const wrapper = shallow(<AddNoteScreen route={routeMock} />);
        expect(wrapper).toMatchSnapshot();
    });
});

describe('LocationWindow', () => {
  let wrapper;
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15); 

  beforeEach(() => {
      Platform.OS = 'ios';
      wrapper = shallow(<LocationWindow time={mockTime} setTime={mockSetTime} />);
  });

  afterEach(() => {
      jest.resetModules(); 
      mockSetTime.mockClear(); 
  });

  it('showpicker shows that when the time button is clicked, the Select Date & Time button should be displayed on iOS', () => {
    const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} />);
    const selectButton = wrapper.find(Button);
    expect(selectButton.prop('title')).toBe('Select Date & Time');
  });

  it('When timepicker is selected, the display is saved on IOS', () => {
    const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} showPicker={true} />);
    const saveButton = wrapper.find(Button);
    expect(saveButton.exists()).toBe(true);
  });

});
describe('LocationWindow', () => {
  let wrapper;
  const mockSetTime = jest.fn();
  const mockTime = new Date(2020, 5, 15); 

  beforeEach(() => {
      Platform.OS = 'android';
      wrapper = shallow(<LocationWindow time={mockTime} setTime={mockSetTime} />);
  });

  afterEach(() => {
      jest.resetModules(); 
      mockSetTime.mockClear(); 
  });

  it('showpicker shows that when the time button is clicked, the Select Date & Time button should be displayed on Android', () => {
    const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} />);
    const selectButton = wrapper.find(Button);
    expect(selectButton.prop('title')).toBe('Select Date & Time');
  });

  it('When timepicker is selected, the display is saved on Android', () => {
    const wrapper = shallow(<LocationWindow time={new Date()} setTime={() => {}} showPicker={true} />);
    const saveButton = wrapper.find(Button);
    expect(saveButton.exists()).toBe(true);
  });

});

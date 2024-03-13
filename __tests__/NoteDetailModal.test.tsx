import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from "enzyme";
import NoteDetailModal from '../lib/screens/mapPage/NoteDetailModal.tsx';

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
      theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

describe("NoteDetailModal", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<NoteDetailModal />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should respond to image button press", () => {
    const wrapper = shallow(<NoteDetailModal />);
    const imageButton = wrapper.findWhere(node => node.prop('testID') === 'imageButton').first();
    expect(imageButton.exists()).toBe(true); // Ensure the button exists

    imageButton.props().onPress();
  });

  it("should respond to video button press", () => {
    const wrapper = shallow(<NoteDetailModal />);
    const videoButton = wrapper.findWhere(node => node.prop('testID') === 'videoButton').first();
    expect(videoButton.exists()).toBe(true); // Ensure the button exists

    videoButton.props().onPress();
  });
});
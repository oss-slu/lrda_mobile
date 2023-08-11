import React from 'react';
import { shallow } from "enzyme";
import AddNoteScreen from '../lib/screens/AddNoteScreen';

describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<AddNoteScreen />);
    expect(wrapper).toMatchSnapshot();
  });

  // You can add other test cases here...
});

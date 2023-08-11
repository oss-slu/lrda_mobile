import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from "enzyme";
import AddNoteScreen from '../lib/screens/AddNoteScreen';

describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<AddNoteScreen />);
    expect(wrapper).toMatchSnapshot();
  });
});

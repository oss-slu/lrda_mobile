import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from "enzyme";
import LoginScreen from '../lib/screens/loginScreens/LoginScreen.tsx';

describe("LoginScreen", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<LoginScreen />);
    expect(wrapper).toMatchSnapshot();
  });
});
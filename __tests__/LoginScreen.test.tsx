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

  it("triggers login function when login button is pressed while keyboard is mounted", () => {
    // Mock the login function prop
    const mockLoginFunction = jest.fn();

    // Pass the mockLoginFunction as the login prop to the LoginScreen component
    const wrapper = shallow(<LoginScreen login={mockLoginFunction} />);

    // Simulate user input in username and password fields
    wrapper.find('TextInput[placeholder="Username"]').simulate('changeText', 'testuser');
    wrapper.find('TextInput[placeholder="Password"]').simulate('changeText', 'password123');

    wrapper.find('TouchableOpacity').simulate('press');

    // Assert that the login function was called
    expect(mockLoginFunction).toHaveBeenCalled();
  });
});
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import { shallow } from 'enzyme';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AppNavigator, { RootStackParamList } from '../lib/navigation/AppNavigator';
import HomeScreen from '../lib/screens/HomeScreen';
import LoginScreen from '../lib/screens/loginScreens/LoginScreen';
import RegisterScreen from '../lib/screens/loginScreens/RegisterScreen';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import EditNote from '../lib/screens/EditNoteScreen';

const Stack = createStackNavigator<RootStackParamList>();

describe('AppNavigator', () => {
  it('renders NavigationContainer with correct props', () => {
    const wrapper = shallow(<AppNavigator />);
    const navigationContainer = wrapper.find(NavigationContainer);
    expect(navigationContainer).toHaveLength(1);
  });

  it('renders Stack.Navigator with correct initial route', () => {
    const wrapper = shallow(<AppNavigator />);
    const stackNavigator = wrapper.find(Stack.Navigator);
    expect(stackNavigator.prop('initialRouteName')).toEqual('Login');
  });

  it('renders HomeScreen component with correct props', () => {
    const props = { username: 'JohnDoe' };
    const wrapper = shallow(<AppNavigator />);
    const homeScreen = wrapper.findWhere((node) => node.prop('name') === 'Home').prop('component');
    const homeScreenWrapper = shallow(<homeScreen {...props} />);
    expect(homeScreenWrapper.prop('username')).toEqual('JohnDoe');
  });

  it('renders AddNoteScreen component with correct props', () => {
    const onSave = jest.fn();
    const wrapper = shallow(<AppNavigator />);
    const addNoteScreen = wrapper.findWhere((node) => node.prop('name') === 'AddNote').prop('component');
    const addNoteScreenWrapper = shallow(<addNoteScreen onSave={onSave} />);
    expect(addNoteScreenWrapper.prop('onSave')).toEqual(onSave);
  });

  it('renders EditNote component with correct props', () => {
    const onSave = jest.fn();
    const note = { id: 1, title: 'Test Note', content: 'This is a test note' };
    const wrapper = shallow(<AppNavigator />);
    const editNoteScreen = wrapper.findWhere((node) => node.prop('name') === 'EditNote').prop('component');
    const editNoteScreenWrapper = shallow(<editNoteScreen note={note} onSave={onSave} />);
    expect(editNoteScreenWrapper.prop('note')).toEqual(note);
    expect(editNoteScreenWrapper.prop('onSave')).toEqual(onSave);
  });

  it('renders LoginScreen component', () => {
    const wrapper = shallow(<AppNavigator />);
    const loginScreen = wrapper.findWhere((node) => node.prop('name') === 'Login').prop('component');
    expect(loginScreen).toEqual(LoginScreen);
  });

  it('renders RegisterScreen component', () => {
    const wrapper = shallow(<AppNavigator />);
    const registerScreen = wrapper.findWhere((node) => node.prop('name') === 'Register').prop('component');
    expect(registerScreen).toEqual(RegisterScreen);
  });
});

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React, { SetStateAction, useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { shallow } from "enzyme";
import { requestMediaLibraryPermissionsAsync, launchImageLibraryAsync } from "expo-image-picker";
import handleNewMedia from "../lib/components/photoScroller";

import AddNoteScreen from '../lib/screens/AddNoteScreen';
import PhotoScroller from "../lib/components/photoScroller";
import { Media } from '../lib/models/media_class';


describe("AddNoteScreen", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<AddNoteScreen />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('PhotoScroller\'s handleNewMedia method', () => {
  it('Show an alert when pressed with Take a photo or Choose a photo from camera roll', () => {

    const wrapper = shallow(<PhotoScroller newMedia={[]} setNewMedia={function (value: SetStateAction<Media[]>): void {
      throw new Error('Function not implemented.');
    } } active={true} />);
    const button = wrapper.find('[testID="photoScrollerButton"]');

    const mockAlert = jest.spyOn(Alert, 'alert');
    button.props().onPress();
    
    wrapper.find(TouchableOpacity).prop('onPress')();

    expect(mockAlert).toHaveBeenCalledWith(
      'Select Media',
      'Choose the source for your media:',
      expect.any(Array),
      { cancelable: false }
    );
  });
});
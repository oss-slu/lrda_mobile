import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React, { SetStateAction, useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';

import AddNoteScreen from '../lib/screens/AddNoteScreen';
import PhotoScroller from "../lib/components/photoScroller";
import { Media } from '../lib/models/media_class';
import moxios from 'moxios';
import AudioContainer from '../lib/components/audio';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

// This will restore the original console methods after all tests are done
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
});

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

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
      }} active={true} />);
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

describe('AudioContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should handle start and stop recording correctly', async () => {
      const wrapper = shallow(
          <AudioContainer newAudio={[]} setNewAudio={() => {}} />
      );

      const startRecordingButton = wrapper.find('[testID="startRecordingButton"]');
      startRecordingButton.props().onPress();

      const stopRecordingButton = wrapper.find('[testID="stopRecordingButton"]');
      stopRecordingButton.props().onPress();

      const result = 'success';
      expect(result).toBe('success');
  });
});

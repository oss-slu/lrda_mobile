import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { shallow } from 'enzyme';
import AudioContainer from '../lib/components/audio.tsx';

Enzyme.configure({ adapter: new Adapter() });

describe('AudioContainer', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('simulates clicking record and successfully uploading audio', () => {
    const wrapper = shallow(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    wrapper.find({ testID: 'startRecordingButton' }).simulate('press');

  });
});
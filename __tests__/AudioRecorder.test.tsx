import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { shallow } from 'enzyme';
import moxios from 'moxios';
import AudioContainer from '../lib/components/audio.tsx';
import { S3_PROXY_PREFIX } from'../lib/utils/S3_proxy'

Enzyme.configure({ adapter: new Adapter() });

describe('AudioContainer', () => {
  beforeEach(() => {
    moxios.install(); 
  });

  afterEach(() => {
    moxios.uninstall(); 
  });

  it('renders without crashing', () => {
    const wrapper = shallow(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('simulates clicking record and successfully uploading audio', async () => {
    const wrapper = shallow(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    wrapper.find({ testID: 'startRecordingButton' }).simulate('press');
    

    moxios.stubRequest(S3_PROXY_PREFIX + 'uploadFile', {
      status: 200, 
      response: {
        location: 'https://example.com/audio.mp3', 
      },
    });
    
 
    await new Promise((resolve) => setTimeout(resolve, 1000)); 

    expect(wrapper.find({ testID: 'successMessage' }).exists()).toEqual(false);
  });
}
)

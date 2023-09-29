import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from 'enzyme';
import AudioContainer from '../lib/components/audio.tsx';

describe('AudioContainer', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});

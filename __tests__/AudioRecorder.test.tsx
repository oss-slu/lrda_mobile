import { render } from '@testing-library/react-native';
import React from 'react';
import AudioContainer from '../lib/components/audio';
import moxios from 'moxios';

// Silence console warnings during the test
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});  // Silences console.warn
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  console.warn.mockRestore();  // Restores original behavior after each test
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall()
});

describe('AudioContainer', () => {
  it('renders without crashing', () => {
    const wrapper = render(<AudioContainer newAudio={[]} setNewAudio={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});

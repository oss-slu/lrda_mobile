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

  it('renders with audio', () => {
    // Render the AudioContainer component with a mock audio item in the newAudio array
    const wrapper = render(
      <AudioContainer 
        newAudio={[{ uri: 'test', name: 'test' }]} // Mock audio data to simulate an audio item
        setNewAudio={() => {}} // Pass an empty function as the setNewAudio prop (mocking the state setter)
      />
    ); 
  
    // Assert that the rendered output matches the stored snapshot
    // This ensures the component renders correctly with the provided audio data
    expect(wrapper).toMatchSnapshot();
  });
   
  
});

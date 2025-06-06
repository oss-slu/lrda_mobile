import { render } from '@testing-library/react-native';
import React from 'react';
import AudioContainer from '../lib/components/audio';
import moxios from 'moxios';

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('react-native/Libraries/Image/Image', () => ({
  ...jest.requireActual('react-native/Libraries/Image/Image'),
  resolveAssetSource: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
}));


jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({
    settings: {},
  })),
}));

// Silence console warnings during the test
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  moxios.install();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  moxios.uninstall();
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

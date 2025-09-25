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
    const { getByTestId } = render(<AudioContainer newAudio={[]} setNewAudio={() => {}} insertAudioToEditor={() => {}} />);
    expect(getByTestId('audio-container')).toBeTruthy(); // or whatever testID you use
  });

  it('renders with audio', () => {
    const { getByText } = render(
      <AudioContainer
        newAudio={[{ uri: 'test', name: 'test', duration: '00:00', isPlaying: false, isAudio: true, getDuration: () => '00:00', getUuid: () => 'test-uuid', getUri: () => 'test', getType: () => 'audio', getIsPlaying: () => false, setIsPlaying: () => {}, getName: () => 'test' } as any]}
        setNewAudio={() => {}}
        insertAudioToEditor={() => {}}
      />
    );

    // Check that the audio name appears
    expect(getByText('test')).toBeTruthy();

    // Optional: if your audio item has a play button
    // expect(getByA11yLabel('Play')).toBeTruthy();
  });
});

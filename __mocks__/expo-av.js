export const Audio = {
  setAudioModeAsync: jest.fn(),
  Sound: jest.fn().mockImplementation(() => ({
    loadAsync: jest.fn(),
    playAsync: jest.fn(),
    unloadAsync: jest.fn(),
    pauseAsync: jest.fn(),
    stopAsync: jest.fn(),
  })),
};

export const Video = jest.fn(() => null);
export const ResizeMode = {
  CONTAIN: 'contain',
  COVER: 'cover',
  STRETCH: 'stretch',
  CENTER: 'center',
};

export const Audio = {
  setAudioModeAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  Sound: jest.fn().mockImplementation(() => ({
    loadAsync: jest.fn(),
    playAsync: jest.fn(),
    unloadAsync: jest.fn(),
    pauseAsync: jest.fn(),
    stopAsync: jest.fn(),
    getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, durationMillis: 1000 })),
    setOnPlaybackStatusUpdate: jest.fn(),
    setPositionAsync: jest.fn(),
  })),
  Recording: {
    createAsync: jest.fn(() => Promise.resolve({
      recording: {
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'mock-uri'),
      }
    })),
  },
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
  },
};

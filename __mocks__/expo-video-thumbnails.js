// Mock for expo-video-thumbnails
module.exports = {
  getThumbnailAsync: jest.fn(() =>
    Promise.resolve({
      uri: 'mock-thumbnail-uri.jpg',
      width: 200,
      height: 200,
    })
  ),
};

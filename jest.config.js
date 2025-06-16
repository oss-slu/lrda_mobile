module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/setupTests.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|expo|@expo|@unimodules)'
  ],
 moduleNameMapper: {
  '^react-native-draggable-flatlist$': '<rootDir>/__mocks__/react-native-draggable-flatlist.js',
  '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
  '^expo-av$': '<rootDir>/__mocks__/expo-av.js',
  '^react-native/Libraries/Animated/NativeAnimatedHelper$': '<rootDir>/__mocks__/NativeAnimatedHelper.js',
}

};

module.exports = {
  preset: 'jest-expo', // Make sure you're using the jest-expo preset for Expo and React Native
  testEnvironment: 'node', // Keep the Node environment for React Native
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect', // This adds React Native matchers
    '<rootDir>/setupTests.js', // Your setup file
  ],
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|expo|@expo|@unimodules)' // Ensure proper transformation of React Native modules
  ],
};

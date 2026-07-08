// Pin the timezone so date-rendering snapshots are deterministic across machines
process.env.TZ = "America/Chicago";

module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|@react-native-community|expo-modules-core|expo|@expo|@unimodules)/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^react-native/Libraries/Animated/NativeAnimatedHelper$": "<rootDir>/__mocks__/NativeAnimatedHelper.js",
  },
};

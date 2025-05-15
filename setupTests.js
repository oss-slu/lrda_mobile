// setupTests.js
import '@testing-library/jest-native/extend-expect'; // Provides useful matchers like toBeInTheDocument for React Native components

// Mock Firebase Auth globally for all tests
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.reslve({ exists: () => false })),
}));
// setupTests.js
import '@testing-library/jest-native/extend-expect'; // Provides useful matchers like toBeInTheDocument for React Native components

// Mock Firebase Auth globally for all tests
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
}));

// Mock Expo Router globally for all tests
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: () => true,
};
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
  useFocusEffect: jest.fn(),
  useNavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
  }),
  Link: 'Link',
  Redirect: 'Redirect',
  Stack: { Screen: 'Screen', Protected: 'Protected' },
  Tabs: { Screen: 'Screen' },
}));

// Mock @react-navigation/native (used by some screen components for useFocusEffect)
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
  }),
}));
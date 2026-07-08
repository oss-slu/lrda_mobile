// Mock Expo Router globally for all tests
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: () => true,
};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  usePathname: () => "/",
  useSegments: () => [],
  useFocusEffect: jest.fn(),
  useNavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
  }),
  Link: "Link",
  Redirect: "Redirect",
  Stack: { Screen: "Screen", Protected: "Protected" },
  Tabs: { Screen: "Screen" },
}));

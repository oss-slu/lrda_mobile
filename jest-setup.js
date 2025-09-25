// Global test setup
// Set environment variables before any modules are imported
process.env.EXPO_OS = 'ios';

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Only suppress the specific EXPO_OS warning
  if (args[0] && args[0].includes('The global process.env.EXPO_OS is not defined')) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  // Suppress specific act() warnings from carousel animations
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('The current testing environment is not configured to support act') ||
     args[0].includes('An update to Animated(View) inside a test was not wrapped in act'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Note: Individual test files handle their own mocks and cleanup

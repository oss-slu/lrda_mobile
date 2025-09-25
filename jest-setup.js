// Global test setup
// Set environment variables before any modules are imported
process.env.EXPO_OS = 'ios';

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Only suppress the specific EXPO_OS warning
  if (args[0] && args[0].includes('The global process.env.EXPO_OS is not defined')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Note: Individual test files handle their own mocks and cleanup

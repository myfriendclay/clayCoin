import 'reflect-metadata';

// Make Jest functions available globally
declare global {
  var afterEach: jest.Lifecycle;
  var jest: typeof import('@jest/globals').jest;
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
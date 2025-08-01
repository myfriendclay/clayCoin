import 'reflect-metadata';
import { jest } from '@jest/globals';

// Make Jest available globally
global.jest = jest;
// Make afterEach available globally
global.afterEach = jest.fn;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 
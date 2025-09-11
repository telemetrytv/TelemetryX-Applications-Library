// Test setup file for Jest
import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3456'; // Use different port for tests

// Global test utilities
global.testTimeout = 5000;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(() => {
  // Close any open handles
  jest.restoreAllMocks();
});
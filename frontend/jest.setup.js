// Import Jest DOM Matchers
require('@testing-library/jest-dom');

// Mock Next/Router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_BACKEND_URL: 'http://localhost:4000',
  JWT_SECRET: 'test-secret-key',
};

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock window.fetch
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
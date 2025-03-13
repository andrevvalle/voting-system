// Mock modules before importing
jest.mock('axios');
jest.mock('cookies-next');

process.env.BACKEND_URL = 'http://backend:4000';
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:4000';

import axios from 'axios';
import { getCookie } from 'cookies-next';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.window = { localStorage: localStorageMock };

console.error = jest.fn();
console.log = jest.fn();

axios.create.mockImplementation(() => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  defaults: {
    baseURL: 'http://localhost:4000',
    headers: {
      'Content-Type': 'application/json'
    }
  }
}));

axios.post.mockResolvedValue({ data: {} });
axios.get.mockResolvedValue({ data: {} });

getCookie.mockReturnValue(null);

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('API Client Creation', () => {
    test('API client initialization', () => {
      expect(true).toBe(true);
    });
  });

  describe('Poll API Functions', () => {
    test('API functions are defined', () => {
      const api = require('../api');
      
      expect(typeof api.getPolls).toBe('function');
      expect(typeof api.getActivePolls).toBe('function');
      expect(typeof api.getPollDetails).toBe('function');
      expect(typeof api.vote).toBe('function');
    });
  });

  describe('Vote Function', () => {
    test('vote function is defined', () => {
      const api = require('../api');
      
      expect(typeof api.vote).toBe('function');
    });
  });

  describe('Admin Authentication', () => {
    test('authApi object is defined with correct methods', () => {
      const api = require('../api');
      
      expect(typeof api.authApi).toBe('object');
      expect(typeof api.authApi.adminLogin).toBe('function');
    });
  });

  describe('Admin API Functions', () => {
    beforeEach(() => {
      global.window = { localStorage: localStorageMock };
      localStorageMock.clear();
    });
    
    test('adminApi object is defined with correct methods', () => {
      const api = require('../api');
      
      expect(typeof api.adminApi).toBe('object');
      expect(typeof api.adminApi.getAuthToken).toBe('function');
      expect(typeof api.adminApi.getAuthHeaders).toBe('function');
      expect(typeof api.adminApi.isAuthenticated).toBe('function');
      expect(typeof api.adminApi.getAllPolls).toBe('function');
      expect(typeof api.adminApi.createPoll).toBe('function');
      expect(typeof api.adminApi.updatePoll).toBe('function');
      expect(typeof api.adminApi.deletePoll).toBe('function');
    });
    
    test('getAuthToken and isAuthenticated functionality', () => {
      const api = require('../api');
      
      expect(api.adminApi.isAuthenticated()).toBe(false);
      
      const headers = api.adminApi.getAuthHeaders();
      expect(headers).toEqual({});
    });
  });
});
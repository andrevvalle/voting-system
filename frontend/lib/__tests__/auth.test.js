import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { checkPermission, generateVoteToken, getUserId, verifyVoteToken } from '../auth';

jest.mock('jsonwebtoken');

jest.mock('cookies-next', () => ({
  getCookie: jest.fn(),
}));

console.error = jest.fn();
console.log = jest.fn();

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...process.env,
      JWT_SECRET: 'test-secret',
      VOTE_TOKEN_EXPIRY: '10m',
    };
  });

  describe('generateVoteToken', () => {
    test('generates token with correct payload and options', () => {
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1677609600000);
      
      jwt.sign.mockReturnValue('generated-jwt-token');
      
      const token = generateVoteToken('poll123', 'participant456', 'user789');
      
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          pollId: 'poll123',
          participantId: 'participant456',
          userId: 'user789',
          timestamp: 1677609600000,
        },
        'test-secret',
        { expiresIn: '10m' }
      );
      
      expect(token).toBe('generated-jwt-token');
      
      Date.now = originalDateNow;
    });

    test('uses default secret when not provided in environment', () => {
      delete process.env.JWT_SECRET;
      
      jwt.sign.mockReturnValue('generated-jwt-token');
      
      const token = generateVoteToken('poll123', 'participant456', 'user789');
      
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'voting-system-secret-key',
        expect.any(Object)
      );
    });

    test('uses default expiry when not provided in environment', () => {
      delete process.env.VOTE_TOKEN_EXPIRY;
      
      jwt.sign.mockReturnValue('generated-jwt-token');
      
      const token = generateVoteToken('poll123', 'participant456', 'user789');
      
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '5m' }
      );
    });
  });

  describe('verifyVoteToken', () => {
    test('verifies a valid token and returns decoded payload', () => {
      const mockPayload = {
        pollId: 'poll123',
        participantId: 'participant456',
        userId: 'user789',
      };
      
      jwt.verify.mockReturnValue(mockPayload);
      
      const result = verifyVoteToken('valid-token');
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(result).toEqual(mockPayload);
    });

    test('returns null for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const result = verifyVoteToken('invalid-token');
      
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getUserId', () => {
    test('gets user ID from cookie when available', () => {
      getCookie.mockReturnValue('user123');
      
      const req = {}, res = {};
      const userId = getUserId(req, res);
      
      expect(getCookie).toHaveBeenCalledWith('voter_id', { req, res });
      expect(userId).toBe('user123');
    });

    test('returns null when cookie is not available', () => {
      getCookie.mockReturnValue(null);
      
      const req = {}, res = {};
      const userId = getUserId(req, res);
      
      expect(userId).toBeNull();
    });
  });

  describe('checkPermission', () => {
    test('allows basic actions for any user', () => {
      expect(checkPermission('user123', 'view', 'polls')).toBe(true);
      expect(checkPermission('user123', 'vote', 'polls')).toBe(true);
    });

    test('denies administrative actions by default', () => {
      expect(checkPermission('user123', 'create', 'polls')).toBe(false);
      expect(checkPermission('user123', 'update', 'polls')).toBe(false);
      expect(checkPermission('user123', 'delete', 'polls')).toBe(false);
    });
  });
});
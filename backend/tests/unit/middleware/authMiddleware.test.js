const jwt = require('jsonwebtoken');
const redisService = require('../../../src/services/redisService');

const originalConsoleLog = console.log;
console.log = jest.fn();

const { verifyAdminAuth, ipRateLimiter, verifyRecaptcha } = require('../../../src/middleware/authMiddleware');

console.log = originalConsoleLog;

jest.mock('jsonwebtoken');
jest.mock('../../../src/services/redisService');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    req = {
      headers: {
        authorization: 'Bearer token123'
      },
      body: {},
      ip: '127.0.0.1'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('verifyAdminAuth', () => {
    it('deve autenticar um admin com token válido', () => {
      const decodedToken = {
        id: 'admin123',
        username: 'admin',
        isAdmin: true
      };
      
      jwt.verify.mockReturnValue(decodedToken);
      
      verifyAdminAuth(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('token123', expect.any(String));
      
      expect(req.user).toEqual(decodedToken);
      
      expect(next).toHaveBeenCalled();
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('deve rejeitar requisições sem token de autenticação', () => {
      req.headers.authorization = undefined;
      
      verifyAdminAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('No authentication token provided')
        })
      );
      
      expect(next).not.toHaveBeenCalled();
    });
    
    it('deve rejeitar tokens inválidos', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      verifyAdminAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid or expired token')
        })
      );
      
      expect(next).not.toHaveBeenCalled();
    });
    
    it('deve rejeitar tokens de usuários não-admin', () => {
      const decodedToken = {
        id: 'user123',
        username: 'user',
        isAdmin: false
      };
      
      jwt.verify.mockReturnValue(decodedToken);
      
      verifyAdminAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Admin privileges required')
        })
      );
      
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('ipRateLimiter', () => {
    it('deve permitir requisições dentro do limite', async () => {
      redisService.checkRateLimit.mockResolvedValue({
        allowed: true,
        current: 10,
        remaining: 50,
        resetTime: Math.floor(Date.now() / 1000) + 30
      });
      
      await ipRateLimiter(req, res, next);
      
      expect(redisService.checkRateLimit).toHaveBeenCalledWith('127.0.0.1', 60, 60);
      
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 50);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
      
      expect(next).toHaveBeenCalled();
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('deve bloquear requisições que excedem o limite', async () => {
      redisService.checkRateLimit.mockResolvedValue({
        allowed: false,
        current: 61,
        remaining: 0,
        resetTime: Math.floor(Date.now() / 1000) + 30
      });
      
      await ipRateLimiter(req, res, next);
      
      expect(redisService.checkRateLimit).toHaveBeenCalled();
      
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
      
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: expect.stringContaining('Limite de requisições excedido')
        })
      );
      
      expect(next).not.toHaveBeenCalled();
    });
    
    it('deve usar o IP de X-Forwarded-For quando disponível', async () => {
      req.ip = undefined;
      req.headers['x-forwarded-for'] = '192.168.1.1';
      
      redisService.checkRateLimit.mockResolvedValue({
        allowed: true,
        current: 5,
        remaining: 55,
        resetTime: Math.floor(Date.now() / 1000) + 30
      });
      
      await ipRateLimiter(req, res, next);
      
      expect(redisService.checkRateLimit).toHaveBeenCalledWith('192.168.1.1', 60, 60);
      
      expect(next).toHaveBeenCalled();
    });
  });
  
  describe('verifyRecaptcha', () => {
    it('deve definir um score reCAPTCHA quando o token está presente', async () => {
      req.body.recaptchaToken = 'recaptcha-token-123';
      
      await verifyRecaptcha(req, res, next);
      
      expect(req.recaptchaScore).toBe(0.9);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('deve permitir requisições mesmo sem token reCAPTCHA', async () => {
      req.body.recaptchaToken = undefined;
      
      await verifyRecaptcha(req, res, next);
      
      expect(req.recaptchaScore).toBe(0.9);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('deve continuar a requisição mesmo em caso de erro', async () => {
      const error = new Error('reCAPTCHA verification failed');
      
      jest.spyOn(console, 'error').mockImplementation(() => {
        throw error;
      });
      
      await verifyRecaptcha(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
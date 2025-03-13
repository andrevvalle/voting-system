const Redis = require('ioredis');
const redisServicePath = '../../../src/services/redisService';

jest.mock('ioredis', () => {
  const mockRedisInstance = {
    incr: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    ping: jest.fn(),
    on: jest.fn()
  };
  
  return jest.fn().mockImplementation(() => mockRedisInstance);
});

const redisService = require(redisServicePath);

describe('Redis Service', () => {
  let redisMock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    redisMock = redisService.redis;
  });
  
  it('deve incrementar um valor corretamente', async () => {
    const key = 'test:counter';
    const expectedValue = 42;
    
    redisMock.incr.mockResolvedValue(expectedValue);
    
    const result = await redisService.increment(key);
    
    expect(redisMock.incr).toHaveBeenCalledWith(key);
    expect(result).toBe(expectedValue);
  });
  
  it('deve definir um valor com expiração', async () => {
    const key = 'test:expiry';
    const value = 'test-value';
    const seconds = 60;
    
    redisMock.set.mockResolvedValue('OK');
    
    await redisService.setWithExpiry(key, value, seconds);
    
    expect(redisMock.set).toHaveBeenCalledWith(key, value, 'EX', seconds);
  });
  
  it('deve obter um valor', async () => {
    const key = 'test:get';
    const expectedValue = 'stored-value';
    
    redisMock.get.mockResolvedValue(expectedValue);
    
    const result = await redisService.get(key);
    
    expect(redisMock.get).toHaveBeenCalledWith(key);
    expect(result).toBe(expectedValue);
  });
  
  it('deve verificar rate limit corretamente quando permitido', async () => {
    const ip = '127.0.0.1';
    const limit = 10;
    const windowSecs = 60;
    const now = 1612345678;
    
    jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
    
    redisMock.incr.mockResolvedValue(5);
    redisMock.ttl.mockResolvedValue(30);
    
    const result = await redisService.checkRateLimit(ip, limit, windowSecs);
    
    expect(result).toEqual({
      allowed: true,
      current: 5,
      remaining: 5,
      resetTime: now + 30
    });
  });
  
  it('deve verificar rate limit corretamente quando bloqueado', async () => {
    const ip = '127.0.0.1';
    const limit = 10;
    const windowSecs = 60;
    const now = 1612345678;
    
    jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
    
    redisMock.incr.mockResolvedValue(10);
    redisMock.ttl.mockResolvedValue(45);
    
    const result = await redisService.checkRateLimit(ip, limit, windowSecs);
    
    expect(result).toEqual({
      allowed: true,
      current: 10,
      remaining: 0,
      resetTime: now + 45
    });
    
    redisMock.incr.mockResolvedValue(11);
    redisMock.ttl.mockResolvedValue(45);
    
    const resultBlocked = await redisService.checkRateLimit(ip, limit, windowSecs);
    
    expect(resultBlocked).toEqual({
      allowed: false,
      current: 11,
      remaining: 0,
      resetTime: now + 45
    });
  });
  
  it('deve definir expiração na primeira requisição do rate limit', async () => {
    const ip = '127.0.0.1';
    const limit = 10;
    const windowSecs = 60;
    const now = 1612345678;
    
    jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
    
    redisMock.incr.mockResolvedValue(1);
    redisMock.ttl.mockResolvedValue(windowSecs * 2);
    
    await redisService.checkRateLimit(ip, limit, windowSecs);
    
    expect(redisMock.expire).toHaveBeenCalledWith(
      expect.stringContaining(`ratelimit:${ip}:`),
      windowSecs * 2
    );
  });
  
  it('não deve definir expiração em requisições subsequentes do rate limit', async () => {
    const ip = '127.0.0.1';
    const limit = 10;
    const windowSecs = 60;
    const now = 1612345678;
    
    jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
    
    redisMock.incr.mockResolvedValue(2);
    redisMock.ttl.mockResolvedValue(50);
    
    await redisService.checkRateLimit(ip, limit, windowSecs);
    
    expect(redisMock.expire).not.toHaveBeenCalled();
  });
  
  it('deve realizar health check com sucesso', async () => {
    redisMock.ping.mockResolvedValue('PONG');
    
    const result = await redisService.healthCheck();
    
    expect(redisMock.ping).toHaveBeenCalled();
    expect(result).toBe(true);
  });
  
  it('deve falhar no health check quando o ping falha', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    redisMock.ping.mockRejectedValue(new Error('Connection refused'));
    
    const result = await redisService.healthCheck();
    
    expect(redisMock.ping).toHaveBeenCalled();
    expect(result).toBe(false);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro no health check do Redis:'),
      expect.any(Error)
    );
    
    console.error = originalConsoleError;
  });
  
  it('deve falhar no health check quando a resposta não é PONG', async () => {
    redisMock.ping.mockResolvedValue('ERROR');
    
    const result = await redisService.healthCheck();
    
    expect(redisMock.ping).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
beforeAll(() => {
  global.originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  console.log = global.originalConsole.log;
  console.error = global.originalConsole.error;
  console.warn = global.originalConsole.warn;
  console.info = global.originalConsole.info;
});

jest.mock('ioredis', () => {
  const mockRedisInstance = {
    incr: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    ping: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn()
  };
  
  return jest.fn().mockImplementation(() => mockRedisInstance);
});

afterAll(async () => {
  jest.clearAllTimers();

  try {
    const redisService = require('../src/services/redisService');
    if (redisService && redisService.redis && redisService.redis.disconnect) {
      await redisService.redis.disconnect();
    }
  } catch (error) {
    console.error('Erro ao desconectar do Redis:', error);
  }
});
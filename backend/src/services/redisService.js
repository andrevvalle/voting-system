const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('connect', () => {
  console.log('Redis conectado com sucesso');
});

redis.on('error', (err) => {
  console.error('Erro de conexão com Redis:', err);
});

async function increment(key) {
  return await redis.incr(key);
}

async function setWithExpiry(key, value, seconds) {
  await redis.set(key, value, 'EX', seconds);
}

async function get(key) {
  return await redis.get(key);
}

async function checkRateLimit(ip, limit = 60, windowSecs = 60) {
  const key = `ratelimit:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSecs);
  const windowKey = `${key}:${windowStart}`;
  
  const current = await redis.incr(windowKey);
  
  if (current === 1) {
    await redis.expire(windowKey, windowSecs * 2);
  }
  
  const ttl = await redis.ttl(windowKey);
  
  return {
    allowed: current <= limit,
    current,
    remaining: Math.max(0, limit - current),
    resetTime: now + ttl
  };
}

async function healthCheck() {
  try {
    const response = await redis.ping();
    return response === 'PONG';
  } catch (error) {
    console.error('Erro no health check do Redis:', error);
    return false;
  }
}

module.exports = {
  redis,
  increment,
  setWithExpiry,
  get,
  checkRateLimit,
  healthCheck
};
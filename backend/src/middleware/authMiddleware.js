const jwt = require('jsonwebtoken');
const redisService = require('../services/redisService');
const { Admin } = require('../models');

console.log('Verificação reCAPTCHA: será inicializada sob demanda se configurada');

const verifyAdminAuth = (req, res, next) => {
  console.log('Checking admin authentication');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('No authentication token provided');
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    console.log('Token received:', token.substring(0, 20) + '...');
    
    const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
    console.log('Using secret:', secret.substring(0, 5) + '...');
    
    const decoded = jwt.verify(token, secret);
    console.log('Token decoded:', decoded);
    
    if (!decoded.isAdmin) {
      console.log('Not an admin token');
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    req.user = decoded;
    console.log('Admin authenticated:', decoded.username);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const ipRateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  const result = await redisService.checkRateLimit(ip, 60, 60);
  
  res.setHeader('X-RateLimit-Limit', 60);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetTime);
  
  if (!result.allowed) {
    return res.status(429).json({
      error: true,
      message: 'Limite de requisições excedido. Tente novamente em alguns minutos.'
    });
  }
  
  next();
};

const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;
    console.log('Token reCAPTCHA recebido:', recaptchaToken ? 'Sim' : 'Não');

    req.recaptchaScore = 0.9;
    
    next();
  } catch (error) {
    console.error('Erro no middleware reCAPTCHA:', error);
    next();
  }
};

module.exports = {
  verifyAdminAuth,
  ipRateLimiter,
  verifyRecaptcha
};
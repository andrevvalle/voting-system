const redisService = require('../services/redisService');
const sqsService = require('../services/sqsService');
const { testConnection } = require('../models/database');

async function checkHealth(req, res) {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      api: {
        status: 'OK',
      },
      redis: {
        status: 'Unknown',
      },
      database: {
        status: 'Unknown',
      },
      sqs: {
        status: 'Unknown',
      },
    },
  };

  try {
    const redisHealth = await redisService.healthCheck();
    healthStatus.services.redis.status = redisHealth ? 'OK' : 'Error';
  } catch (error) {
    console.error('Erro ao verificar Redis:', error);
    healthStatus.services.redis.status = 'Error';
  }

  try {
    const dbHealth = await testConnection();
    healthStatus.services.database.status = dbHealth ? 'OK' : 'Error';
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    healthStatus.services.database.status = 'Error';
  }

  try {
    const sqsHealth = await sqsService.healthCheck();
    healthStatus.services.sqs.status = sqsHealth ? 'OK' : 'Error';
  } catch (error) {
    console.error('Erro ao verificar SQS:', error);
    healthStatus.services.sqs.status = 'Error';
  }

  const allOk = Object.values(healthStatus.services).every(
    (service) => service.status === 'OK'
  );
  
  if (!allOk) {
    healthStatus.status = 'Degraded';
  }

  const httpStatus = healthStatus.status === 'OK' ? 200 : 503;
  return res.status(httpStatus).json(healthStatus);
}

module.exports = {
  checkHealth
};
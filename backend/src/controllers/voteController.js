const redisService = require('../services/redisService');
const sqsService = require('../services/sqsService');
const { Participant, Poll } = require('../models');
const jwt = require('jsonwebtoken');

async function registerVote(req, res, next) {
  try {
    const { userId, participantId, pollId, voteToken, recaptchaToken } = req.body;
    
    console.log('Recebida requisição de voto:', { 
      userId, 
      participantId, 
      pollId, 
      hasToken: !!voteToken,
      hasRecaptcha: !!recaptchaToken,
      recaptchaScore: req.recaptchaScore || 'N/A'
    });

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    const finalUserId = userId || `temp-user-${Date.now()}`;
    console.log('Usando ID de usuário:', finalUserId);
    
    if (!participantId || !pollId) {
      return res.status(400).json({
        error: true,
        message: 'participantId e pollId são obrigatórios'
      });
    }
    
    if (voteToken) {
      try {
        const decodedToken = jwt.verify(voteToken, process.env.JWT_SECRET);
        
        if (decodedToken.pollId !== pollId || 
            decodedToken.participantId !== participantId || 
            decodedToken.userId !== userId) {
          return res.status(400).json({
            error: true,
            message: 'Token de voto inválido ou adulterado'
          });
        }
        
        const now = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < now) {
          return res.status(400).json({
            error: true,
            message: 'Token de voto expirado'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar token de voto:', error);
        return res.status(400).json({
          error: true,
          message: 'Token de voto inválido'
        });
      }
    }

    const participant = await Participant.findOne({
      where: { id: participantId, pollId }
    });

    if (!participant) {
      return res.status(404).json({
        error: true,
        message: 'Participante não encontrado nesta votação'
      });
    }

    const poll = await Poll.findByPk(pollId);
    if (!poll || !poll.isActive) {
      return res.status(400).json({
        error: true,
        message: 'Esta votação não está ativa'
      });
    }

    const rateLimitKey = `rate_limit:${finalUserId}:${pollId}`;
    const userVoteCount = await redisService.increment(rateLimitKey);
    
    if (userVoteCount === 1) {
      await redisService.setWithExpiry(rateLimitKey, '1', 60);
    }
    
    if (userVoteCount > 20) {
      return res.status(429).json({
        error: true,
        message: 'Limite de votos por minuto excedido para esta votação'
      });
    }
    
    const voteKey = `vote:${pollId}:${participantId}`;
    await redisService.increment(voteKey);
    
    await redisService.increment(`votes:total`);
    await redisService.increment(`votes:poll:${pollId}`);
    
    try {
      await sqsService.sendMessage({
        userId: finalUserId,
        participantId,
        pollId,
        timestamp: new Date().toISOString(),
        ip: ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        recaptchaScore: req.recaptchaScore
      });
    } catch (sqsError) {
      console.error('Erro ao enviar para SQS, mas continuando processamento:', sqsError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Voto registrado com sucesso',
      count: userVoteCount
    });
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    next(error);
  }
}

module.exports = {
  registerVote
};
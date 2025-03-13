const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { verifyRecaptcha } = require('../middleware/authMiddleware');
const redisService = require('../services/redisService');

const voteRateLimiter = async (req, res, next) => {
  const identifier = req.body.userId || req.ip;
  const result = await redisService.checkRateLimit(identifier, 10, 60);
  
  res.setHeader('RateLimit-Limit', 10);
  res.setHeader('RateLimit-Remaining', result.remaining);
  res.setHeader('RateLimit-Reset', result.resetTime);
  
  if (!result.allowed) {
    return res.status(429).json({
      error: true,
      message: 'Muitas requisições de votação, tente novamente em 1 minuto'
    });
  }
  
  next();
};

const verifyCaptchaToken = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;
    
    console.log('Verificando token reCAPTCHA v2:', recaptchaToken ? 'Presente' : 'Ausente');
    
    if (process.env.NODE_ENV !== 'production') {
      if (!recaptchaToken) {
        console.warn('Token reCAPTCHA ausente, mas permitindo em ambiente de desenvolvimento');
        return next();
      }
    } else {
      if (!recaptchaToken) {
        return res.status(400).json({
          error: true,
          message: 'Verificação de segurança necessária'
        });
      }
      
      const axios = require('axios');
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      
      if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY não configurada no ambiente de produção');
        return res.status(500).json({
          error: true,
          message: 'Erro de configuração do servidor'
        });
      }
      
      const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
      
      const recaptchaResponse = await axios.post(verificationURL);
      const { success, score } = recaptchaResponse.data;
      
      if (!success || score < 0.5) {
        return res.status(403).json({
          error: true,
          message: 'Falha na verificação de segurança'
        });
      }
      
      req.recaptchaScore = score;
    }
    
    console.log('Token de verificação aceito');
    next();
  } catch (error) {
    console.error('Erro na verificação do reCAPTCHA:', error);
    
    if (process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        error: true,
        message: 'Erro na verificação de segurança'
      });
    }
    
    console.warn('Erro na verificação, mas permitindo em ambiente de desenvolvimento');
    next();
  }
};

/**
 * @swagger
 * /vote:
 *   post:
 *     summary: Registra um novo voto em uma votação
 *     description: Registra o voto de um usuário para um participante em uma votação específica
 *     tags: [Votos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pollId
 *               - participantId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Identificador do usuário (opcional)
 *               pollId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da votação
 *               participantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do participante que está recebendo o voto
 *               voteToken:
 *                 type: string
 *                 description: Token JWT opcional para verificação de voto
 *               recaptchaToken:
 *                 type: string
 *                 description: Token do reCAPTCHA para verificação anti-bot
 *     responses:
 *       200:
 *         description: Voto registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Voto registrado com sucesso
 *                 count:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Dados inválidos ou faltando
 *       403:
 *         description: Falha na verificação de segurança
 *       404:
 *         description: Participante ou votação não encontrados
 *       429:
 *         description: Limite de taxa excedido
 */
router.post('/', voteRateLimiter, verifyCaptchaToken, voteController.registerVote);

module.exports = router;
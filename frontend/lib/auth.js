import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
export const generateVoteToken = (pollId, participantId, userId) => {
  const payload = {
    pollId,
    participantId,
    userId,
    timestamp: Date.now(),
  };

  const secret = process.env.JWT_SECRET || 'voting-system-secret-key';
  
  console.log('Gerando token com secret:', secret ? 'Secret configurado' : 'Secret não encontrado');
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.VOTE_TOKEN_EXPIRY || '5m',
  });
};

export const getUserId = (req, res) => {
  return getCookie('voter_id', { req, res }) || null;
};

export const verifyVoteToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
};

export const checkPermission = (userId, action, resource) => {
  const basicActions = ['view', 'vote'];
  
  if (basicActions.includes(action)) {
    return true;
  }
  
  return false;
};
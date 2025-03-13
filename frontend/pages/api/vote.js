import axios from 'axios';
import { checkPermission, generateVoteToken, getUserId } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: true, 
      message: 'Método não permitido' 
    });
  }
  
  const userId = getUserId(req, res);
  
  if (!userId) {
    return res.status(401).json({ 
      error: true, 
      message: 'ID de usuário não encontrado' 
    });
  }
  
  const { pollId, participantId } = req.body;
  
  if (!pollId || !participantId) {
    return res.status(400).json({ 
      error: true, 
      message: 'Dados insuficientes para votação' 
    });
  }
  
  if (!checkPermission(userId, 'vote', 'poll')) {
    return res.status(403).json({ 
      error: true, 
      message: 'Permissão negada para votar' 
    });
  }
  
  try {
    const voteToken = generateVoteToken(pollId, participantId, userId);
    
    const voteData = {
      userId,
      participantId,
      pollId,
      voteToken
    };
    console.log('Enviando voto para backend:', {
      url: `${process.env.BACKEND_URL}/vote`,
      userId: userId,
      pollId: pollId,
      participantId: participantId
    });
    
    const response = await axios.post(
      `${process.env.BACKEND_URL}/vote`, 
      voteData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro ao processar voto:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true, 
      message: 'Erro ao processar voto' 
    });
  }
}
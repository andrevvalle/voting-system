import axios from 'axios';
import { getUserId, checkPermission } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: true, 
      message: 'Método não permitido' 
    });
  }
  
  const userId = getUserId(req, res);
  
  const { pollId } = req.query;
  
  if (!pollId) {
    return res.status(400).json({ 
      error: true, 
      message: 'ID da votação não especificado' 
    });
  }
  
  if (!checkPermission(userId, 'view', 'poll')) {
    return res.status(403).json({ 
      error: true, 
      message: 'Permissão negada para visualizar resultados' 
    });
  }
  
  try {
    const response = await axios.get(
      `${process.env.BACKEND_URL}/status/${pollId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`Erro ao buscar resultados da votação ${pollId}:`, error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true, 
      message: 'Erro ao buscar resultados da votação' 
    });
  }
}
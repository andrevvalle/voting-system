import axios from 'axios';
import { checkPermission, getUserId } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: true, 
      message: 'Método não permitido' 
    });
  }
  
  const userId = getUserId(req, res);
  
  if (!checkPermission(userId, 'view', 'polls')) {
    return res.status(403).json({ 
      error: true, 
      message: 'Permissão negada para listar votações' 
    });
  }
  
  try {
    const response = await axios.get(
      `${process.env.BACKEND_URL}/status`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro ao listar votações ativas:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true, 
      message: 'Erro ao listar votações ativas' 
    });
  }
}
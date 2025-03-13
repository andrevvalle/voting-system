import axios from 'axios';
import { getUserId } from '../../../lib/auth';

export default async function handler(req, res) {
  const userId = getUserId(req, res);
  
  if (!userId) {
    return res.status(401).json({ 
      error: true, 
      message: 'ID de usuário não encontrado' 
    });
  }
  
  const backendUrl = process.env.BACKEND_URL;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    let response;
    
    switch (req.method) {
      case 'GET':
        response = await axios.get(`${backendUrl}${req.url}`, { headers });
        break;
        
      case 'POST':
        response = await axios.post(`${backendUrl}${req.url}`, req.body, { headers });
        break;
        
      case 'PUT':
        response = await axios.put(`${backendUrl}${req.url}`, req.body, { headers });
        break;
        
      case 'DELETE':
        response = await axios.delete(`${backendUrl}${req.url}`, { headers });
        break;
        
      default:
        return res.status(405).json({ error: true, message: 'Método não permitido' });
    }
    
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Erro no proxy API:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true, 
      message: 'Erro interno do servidor proxy' 
    });
  }
}
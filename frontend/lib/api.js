import axios from 'axios';

const API_URL = process.env.BACKEND_URL || 'http://backend:4000';

const createApiClient = (serverSide = false) => {
  const baseURL = serverSide 
    ? API_URL 
    : process.env.NEXT_PUBLIC_BACKEND_URL || '/api/proxy';
  
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return api;
};

export const serverApi = createApiClient(true);

export const clientApi = createApiClient(false);

export const getPolls = async () => {
  try {
    const response = await serverApi.get('/admin/polls');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter votações:', error);
    throw error;
  }
};

export const getActivePolls = async (page = 1, limit = 9, filterActive = 'false') => {
  try {
    const response = await clientApi.get('/status', { 
      params: { 
        page, 
        limit,
        filterActive
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter votações:', error);
    throw error;
  }
};


export const getPollDetails = async (pollId) => {
  try {
    const api = typeof window !== 'undefined' ? clientApi : serverApi;
    const response = await api.get(`/status/${pollId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter detalhes da votação ${pollId}:`, error);
    throw error;
  }
};

export const vote = async (pollId, participantId, recaptchaToken) => {
  try {
    console.log('Cliente tentando votar:', { pollId, participantId, hasRecaptcha: !!recaptchaToken });
    
    const response = await clientApi.post(`/vote`, {
      pollId,
      participantId,
      recaptchaToken,
    });
    
    console.log('Resposta do voto:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    console.error('Detalhes do erro:', error.response ? error.response.data : 'Sem detalhes');
    throw error;
  }
};

export const authApi = {
  adminLogin: async (username, password) => {
    try {
      console.log('Attempting login with:', { username });
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/auth/admin/login`, 
        { username, password }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login como admin:', error);
      console.error('Error details:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export const adminApi = {
  getAuthToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  },
  
  getAuthHeaders: () => {
    const token = adminApi.getAuthToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },
  
  isAuthenticated: () => {
    return !!adminApi.getAuthToken();
  },
  
  getAllPolls: async () => {
    try {
      const response = await clientApi.get('/admin/polls', adminApi.getAuthHeaders());
      return response.data.polls || response.data || [];
    } catch (error) {
      console.error('Erro ao obter todas as votações:', error);
      throw error;
    }
  },
  
  createPoll: async (pollData) => {
    try {
      const response = await clientApi.post('/admin/polls', pollData, adminApi.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar votação:', error);
      throw error;
    }
  },
  
  updatePoll: async (pollId, pollData) => {
    try {
      const response = await clientApi.put(`/admin/polls/${pollId}`, pollData, adminApi.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar votação ${pollId}:`, error);
      throw error;
    }
  },
  
  deletePoll: async (pollId) => {
    try {
      const response = await clientApi.delete(`/admin/polls/${pollId}`, adminApi.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir votação ${pollId}:`, error);
      throw error;
    }
  },
};
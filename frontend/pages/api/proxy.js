import axios from 'axios';

export default async function handler(req, res) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://backend:4000';
    
    const endpoint = `${backendUrl}${req.url.replace('/api/proxy', '')}`;
    
    const headers = { ...req.headers };
    delete headers['host'];
    delete headers['connection'];
    delete headers['content-length'];
    
    const response = await axios({
      method: req.method,
      url: endpoint,
      headers,
      data: req.method !== 'GET' ? req.body : undefined,
      validateStatus: () => true,
    });
    
    res.status(response.status);
    
    return res.json(response.data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to backend' });
  }
}
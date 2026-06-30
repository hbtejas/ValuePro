import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('valuepro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('valuepro_refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        localStorage.setItem('valuepro_token', data.data.accessToken);
        localStorage.setItem('valuepro_refresh_token', data.data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem('valuepro_token');
        localStorage.removeItem('valuepro_refresh_token');
        localStorage.removeItem('valuepro_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const calculatorAPI = {
  calculate: (type, data) => api.post(`/calculate/${type}`, data),
};

export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
  save: (data) => api.post('/history', data),
  remove: (id) => api.delete(`/history/${id}`),
};

export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  update: (data) => api.put('/portfolio', data),
  addHolding: (data) => api.post('/portfolio/holdings', data),
  removeHolding: (id) => api.delete(`/portfolio/holdings/${id}`),
};

export const stockAPI = {
  get: (ticker) => api.get(`/stocks/${ticker}`),
  search: (q) => api.get('/stocks/search', { params: { q } }),
};

export default api;

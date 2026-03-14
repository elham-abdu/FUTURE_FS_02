import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public API calls (no token needed)
export const publicAPI = {
  // Submit lead form
  submitLead: (leadData) => api.post('/leads', leadData)
};

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Lead API calls (require token)
export const leadAPI = {
  getAllLeads: (params) => api.get('/leads', { params }),
  getLead: (id) => api.get(`/leads/${id}`),
  updateStatus: (id, status, conversionValue) => 
    api.put(`/leads/${id}/status`, { status, conversionValue }),
  addNote: (id, content) => api.post(`/leads/${id}/notes`, { content }),
  deleteLead: (id) => api.delete(`/leads/${id}`)
};

// Analytics API calls
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary')
};

export default api;
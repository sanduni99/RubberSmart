// frontend/src/services/api.js
const API_BASE_URL = 'http://127.0.0.1:8000';

export const authApi = {
  signup: (data) =>
    fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),

  login: (data) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),
    logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  // Production endpoints
  production: {
    getAll: (skip = 0, limit = 100) => 
      fetchAPI(`/api/production?skip=${skip}&limit=${limit}`),
    getLatest: () => 
      fetchAPI('/api/production/latest'),
  },

  // Price endpoints
  prices: {
    getAll: (skip = 0, limit = 100) => 
      fetchAPI(`/api/prices?skip=${skip}&limit=${limit}`),
    getLatest: () => 
      fetchAPI('/api/prices/latest'),
  },

  // Stats endpoints
  stats: {
    get: () => 
      fetchAPI('/api/stats'),
  },

  // Prediction endpoints - UPDATED to match your backend
  predictions: {
    predictYield: (months = 6) => 
      fetchAPI(`/api/predictions/yield?months=${months}`),
    predictPrice: (months = 6) => 
      fetchAPI(`/api/predictions/price?months=${months}`),
    predictPrice: (months = 6) => 
      fetchAPI(`/api/predictions/yield/by-type?months=${months}`),
  },
};

export default api;
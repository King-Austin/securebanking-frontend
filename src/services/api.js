import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (data) => api.put('/user/profile/', data),
};

// Account API with error handling
export const accountAPI = {
  getAccounts: async () => {
    try {
      const response = await api.get('/accounts/');
      return response;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },
  
  getAccount: async (id) => {
    try {
      const response = await api.get(`/accounts/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  },
  
  createAccount: async (data) => {
    try {
      const response = await api.post('/accounts/', data);
      return response;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },
  
  updateAccount: async (id, data) => {
    try {
      const response = await api.put(`/accounts/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },
};

// Transaction API with error handling
export const transactionAPI = {
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/transactions/', { params });
      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  getTransaction: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },
  
  createTransaction: async (data) => {
    try {
      const response = await api.post('/transactions/', data);
      return response;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  transfer: async (data) => {
    try {
      const response = await api.post('/transactions/transfer/', data);
      return response;
    } catch (error) {
      console.error('Error processing transfer:', error);
      throw error;
    }
  },
};

// Card API with error handling
export const cardAPI = {
  getCards: async () => {
    try {
      const response = await api.get('/cards/');
      return response;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },
  
  createCard: async (data) => {
    try {
      const response = await api.post('/cards/', data);
      return response;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },
  
  updateCard: async (id, data) => {
    try {
      const response = await api.put(`/cards/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },
  
  blockCard: async (id) => {
    try {
      const response = await api.post(`/cards/${id}/block/`);
      return response;
    } catch (error) {
      console.error('Error blocking card:', error);
      throw error;
    }
  },
  
  unblockCard: async (id) => {
    try {
      const response = await api.post(`/cards/${id}/unblock/`);
      return response;
    } catch (error) {
      console.error('Error unblocking card:', error);
      throw error;
    }
  },
};

// Beneficiary API with error handling
export const beneficiaryAPI = {
  getBeneficiaries: async () => {
    try {
      const response = await api.get('/beneficiaries/');
      return response;
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      throw error;
    }
  },
  
  addBeneficiary: async (data) => {
    try {
      const response = await api.post('/beneficiaries/', data);
      return response;
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      throw error;
    }
  },
  
  updateBeneficiary: async (id, data) => {
    try {
      const response = await api.put(`/beneficiaries/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      throw error;
    }
  },
  
  deleteBeneficiary: async (id) => {
    try {
      const response = await api.delete(`/beneficiaries/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      throw error;
    }
  },
};

export default api;

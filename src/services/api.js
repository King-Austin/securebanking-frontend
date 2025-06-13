import axios from 'axios';
import { API_URL, API_TIMEOUT, ENABLE_DEBUG } from '../config/environment.js';

// Create axios instance with environment configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Debug logging in development
    if (ENABLE_DEBUG) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    if (ENABLE_DEBUG) {
      console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Debug logging in development
    if (ENABLE_DEBUG) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Debug logging in development
    if (ENABLE_DEBUG) {
      console.error('❌ API Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    if (error.response?.status === 401) {
      // Remove invalid token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (userData) => api.put('/user/update_profile/', userData),
  changePassword: (passwordData) => api.post('/user/change_password/', passwordData),
};

// Account API calls
export const accountAPI = {
  getAccounts: () => api.get('/accounts/'),
  getAccount: (id) => api.get(`/accounts/${id}/`),
  getAccountTransactions: (id) => api.get(`/accounts/${id}/transactions/`),
  getAccountBalance: (id) => api.get(`/accounts/${id}/balance/`),
};

// Transaction API calls
export const transactionAPI = {
  getTransactions: () => api.get('/transactions/'),
  transfer: (transferData) => api.post('/transactions/transfer/', transferData),
};

// Beneficiary API calls
export const beneficiaryAPI = {
  getBeneficiaries: () => api.get('/beneficiaries/'),
  addBeneficiary: (beneficiaryData) => api.post('/beneficiaries/', beneficiaryData),
  updateBeneficiary: (id, beneficiaryData) => api.put(`/beneficiaries/${id}/`, beneficiaryData),
  deleteBeneficiary: (id) => api.delete(`/beneficiaries/${id}/`),
};

// Card API calls
export const cardAPI = {
  getCards: () => api.get('/cards/'),
  blockCard: (id) => api.post(`/cards/${id}/block_card/`),
  unblockCard: (id) => api.post(`/cards/${id}/unblock_card/`),
};

// Account types and categories
export const referenceAPI = {
  getAccountTypes: () => api.get('/account-types/'),
  getTransactionCategories: () => api.get('/transaction-categories/'),
};

export default api;

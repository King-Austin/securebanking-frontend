import axios from 'axios';
import { config } from '../config/environment.js';

// Helper: Enforce port 5000 only
function enforcePort5000(url) {
  const allowed = /^https?:\/\/localhost:5000(\/|$)/;
  if (!allowed.test(url)) {
    throw new Error('All frontend API calls must go through middleware on port 5000.');
  }
}

// Helper: Envelope wrapper
export function createEnvelope({ encrypted_payload, iv, auth_tag, client_public_key }) {
  return {
    encrypted_payload,
    iv,
    auth_tag,
    client_public_key,
  };
}

// Create axios instance for middleware only
const api = axios.create({
  baseURL: config.API_URL, // always https://localhost:5000/api
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: enforce port 5000 and wrap data in envelope
api.interceptors.request.use(
  (config) => {
    enforcePort5000(config.baseURL);
    // Only wrap POST/PUT/PATCH requests with data
    if (['post', 'put', 'patch'].includes(config.method) && config.data && !config.data.encrypted_payload) {
      // Assume data is already encrypted by the crypto engine
      config.data = createEnvelope(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
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
  getCard: (cardId) => api.get(`/cards/${cardId}/`),
  createCard: (cardData) => api.post('/cards/', cardData),
  updateCard: (cardId, cardData) => api.put(`/cards/${cardId}/`, cardData),
  deleteCard: (cardId) => api.delete(`/cards/${cardId}/`),
  blockCard: (id) => api.post(`/cards/${id}/block_card/`),
  unblockCard: (id) => api.post(`/cards/${id}/unblock_card/`),
  toggleCardStatus: (cardId, status) => api.patch(`/cards/${cardId}/status/`, { status }),
  setPin: (cardId, pin) => api.patch(`/cards/${cardId}/pin/`, { pin }),
  getCardTransactions: (cardId, params = {}) => api.get(`/cards/${cardId}/transactions/`, { params }),
  reportLostStolen: (cardId, reason) => api.post(`/cards/${cardId}/report/`, { reason }),
  requestNewCard: (cardData) => api.post('/cards/request/', cardData),
};

// Reference data API calls
export const referenceAPI = {
  getAccountTypes: () => api.get('/account-types/'),
  getTransactionCategories: () => api.get('/transaction-categories/'),
};

// Health check API calls
export const healthAPI = {
  checkHealth: () => api.get('/health/'),
  checkStatus: () => api.get('/status/'),
};

// Test function to hit backend directly (bypasses crypto)
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection to:', API_URL);
    const response = await api.get('/health/');
    console.log('✅ Backend connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Force API call function (useful for debugging)
export const forceApiCall = async (endpoint = '/health/') => {
  try {
    console.log(`🔧 Force calling API endpoint: ${endpoint}`);
    const response = await api.get(endpoint);
    console.log('🎯 API call successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 API call failed:', error);
    throw error;
  }
};

export default api;

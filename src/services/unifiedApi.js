/**
 * Unified API Client - Backward compatible with crypto enhancement
 * Provides a seamless transition from regular API to SecureCipher
 */

import secureApiClient from '../utils/secureApiClient.js';
import { API_URL, API_TIMEOUT, ENABLE_DEBUG } from '../config/environment.js';

class UnifiedApiClient {
  constructor() {
    this.secureClient = secureApiClient;
    this.preferSecure = true; // Use secure by default
  }

  /**
   * Smart request method - automatically chooses secure or regular API
   */
  async request(config) {
    const { method = 'GET', url, data, headers = {}, ...options } = config;
    
    try {
      // Log request if debugging enabled
      if (ENABLE_DEBUG) {
        console.log('🚀 Unified API Request:', {
          method: method.toUpperCase(),
          url,
          useSecure: this.preferSecure,
          data: data ? '[DATA]' : null,
        });
      }

      let response;
      
      if (this.preferSecure) {
        // Use secure client
        const methodLower = method.toLowerCase();
        switch (methodLower) {
          case 'get':
            response = await this.secureClient.get(url, { headers, ...options });
            break;
          case 'post':
            response = await this.secureClient.post(url, data, { headers, ...options });
            break;
          case 'put':
            response = await this.secureClient.put(url, data, { headers, ...options });
            break;
          case 'patch':
            response = await this.secureClient.patch(url, data, { headers, ...options });
            break;
          case 'delete':
            response = await this.secureClient.delete(url, { headers, ...options });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      } else {
        // Fallback to regular fetch (for compatibility)
        const token = localStorage.getItem('authToken');
        const requestOptions = {
          method: method.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Token ${token}` }),
            ...headers
          },
          body: data && method.toLowerCase() !== 'get' ? JSON.stringify(data) : undefined,
          ...options
        };

        const fetchResponse = await fetch(`${API_URL}${url}`, requestOptions);
        response = await fetchResponse.json();
        
        if (!fetchResponse.ok) {
          throw new Error(response.error || response.message || `HTTP ${fetchResponse.status}`);
        }
      }

      // Log response if debugging enabled
      if (ENABLE_DEBUG) {
        console.log('✅ Unified API Response:', {
          url,
          status: 'success',
          secure: this.preferSecure
        });
      }

      return { data: response };
      
    } catch (error) {
      if (ENABLE_DEBUG) {
        console.error('❌ Unified API Error:', {
          url,
          error: error.message,
          secure: this.preferSecure
        });
      }
      throw error;
    }
  }

  // Axios-compatible methods
  async get(url, config = {}) {
    return this.request({ method: 'GET', url, ...config });
  }

  async post(url, data, config = {}) {
    return this.request({ method: 'POST', url, data, ...config });
  }

  async put(url, data, config = {}) {
    return this.request({ method: 'PUT', url, data, ...config });
  }

  async patch(url, data, config = {}) {
    return this.request({ method: 'PATCH', url, data, ...config });
  }

  async delete(url, config = {}) {
    return this.request({ method: 'DELETE', url, ...config });
  }

  // Configuration methods
  setSecureMode(enabled) {
    this.preferSecure = enabled;
    console.log(`🔧 API Mode: ${enabled ? 'Secure' : 'Regular'}`);
  }

  // Interceptor compatibility (for existing code)
  interceptors = {
    request: {
      use: (fulfilled, rejected) => {
        console.warn('⚠️ Request interceptors not fully supported in unified client');
        return { fulfilled, rejected };
      }
    },
    response: {
      use: (fulfilled, rejected) => {
        console.warn('⚠️ Response interceptors not fully supported in unified client');
        return { fulfilled, rejected };
      }
    }
  };

  // Crypto-specific methods
  async initializeCrypto() {
    return this.secureClient.initializeSession();
  }

  async getCryptoStatus() {
    const hasKeys = await this.secureClient.cryptoEngine.hasKeys();
    const fingerprint = hasKeys ? await this.secureClient.cryptoEngine.getKeyFingerprint() : null;
    
    return {
      enabled: this.preferSecure,
      hasKeys,
      fingerprint,
      initialized: this.secureClient.isInitialized
    };
  }

  async resetCrypto() {
    return this.secureClient.resetCryptoSession();
  }
}

// Create singleton instance
const api = new UnifiedApiClient();

// Export both the unified client and the original secure client
export default api;
export { secureApiClient };

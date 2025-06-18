/**
 * Secure API Client - Integrates with SecureCipher Middleware
 * Handles cryptographic signing and encryption for all API requests
 */

import SecureCipherEngine from './cryptoEngine.js';

class SecureApiClient {
    constructor() {
        this.cryptoEngine = new SecureCipherEngine();
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        this.middlewareURL = import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:8000/api';
        this.sessionToken = null;
        this.isInitialized = false;
    }

    /**
     * Initialize user's cryptographic session
     */
    async initializeSession() {
        if (this.isInitialized) {
            return true;
        }

        try {
            const hasKeys = await this.cryptoEngine.hasKeys();
            
            if (!hasKeys) {
                console.log("🔐 No keys found, generating new cryptographic keys...");
                await this.cryptoEngine.generateKeyPair();
                await this.registerPublicKey();
            } else {
                console.log("✅ Existing cryptographic keys found");
                // Optionally verify with server
                await this.verifyCryptoStatus();
            }
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error("❌ Session initialization failed:", error);
            throw error;
        }
    }

    /**
     * Register user's public key with the server
     */
    async registerPublicKey() {
        try {
            const publicKeyJWK = await this.cryptoEngine.getPublicKeyJWK();
            const fingerprint = await this.cryptoEngine.getKeyFingerprint();
            
            console.log('📤 Registering public key with server...');
            
            const response = await fetch(`${this.middlewareURL}/auth/register-key/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public_key: publicKeyJWK,
                    algorithm: 'ECDSA',
                    curve: 'P-384',
                    fingerprint: fingerprint
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server registration failed: ${errorData.error || response.statusText}`);
            }
            
            const result = await response.json();
            console.log("✅ Public key registered successfully:", result);
            return result;
        } catch (error) {
            console.error("❌ Public key registration failed:", error);
            throw error;
        }
    }

    /**
     * Verify crypto status with server
     */
    async verifyCryptoStatus() {
        try {
            const fingerprint = await this.cryptoEngine.getKeyFingerprint();
            
            const response = await fetch(`${this.middlewareURL}/auth/crypto-status/?fingerprint=${fingerprint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log("🔍 Crypto status verified:", result);
                return result;
            }
        } catch (error) {
            console.warn("⚠️ Crypto status verification failed:", error);
            // Non-critical, continue anyway
        }
    }

    /**
     * Create secure request with cryptographic signature
     */
    async createSecureRequest(endpoint, method = 'GET', data = null, options = {}) {
        await this.initializeSession();
        
        try {
            // Prepare request payload
            const timestamp = new Date().toISOString();
            const requestId = this.generateRequestId();
            
            const requestPayload = {
                endpoint,
                method,
                data,
                timestamp,
                request_id: requestId
            };
            
            // Sign the request
            const signature = await this.cryptoEngine.signData(requestPayload);
            const fingerprint = await this.cryptoEngine.getKeyFingerprint();
            
            // Encrypt sensitive data if present and required
            let encryptedData = null;
            if (data && this.shouldEncrypt(endpoint)) {
                console.log('🔒 Encrypting sensitive data for:', endpoint);
                encryptedData = await this.cryptoEngine.encryptData(data);
            }
            
            // Prepare final request
            const secureRequest = {
                ...requestPayload,
                signature,
                public_key_fingerprint: fingerprint,
                encrypted_data: encryptedData
            };
            
            const requestOptions = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Secure-Cipher': 'true',
                    'X-Request-ID': requestId,
                    'X-Timestamp': timestamp,
                    'X-Signature': signature,
                    'X-Fingerprint': fingerprint,
                    ...options.headers
                },
                body: method !== 'GET' ? JSON.stringify(secureRequest) : undefined,
                ...options
            };

            // Add auth token if available
            const token = this.getAuthToken();
            if (token) {
                requestOptions.headers['Authorization'] = `Token ${token}`;
            }
            
            console.log(`🔐 Secure ${method} request to ${endpoint}:`, {
                requestId,
                signed: true,
                encrypted: !!encryptedData,
                fingerprint: fingerprint.substr(0, 8) + '...'
            });
            
            return fetch(`${this.baseURL}${endpoint}`, requestOptions);
        } catch (error) {
            console.error("❌ Secure request creation failed:", error);
            throw error;
        }
    }

    /**
     * Create regular (non-crypto) request for backward compatibility
     */
    async createRegularRequest(endpoint, method = 'GET', data = null, options = {}) {
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
            ...options
        };

        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
            requestOptions.headers['Authorization'] = `Token ${token}`;
        }

        console.log(`📡 Regular ${method} request to ${endpoint}`);
        return fetch(`${this.baseURL}${endpoint}`, requestOptions);
    }

    /**
     * Determine if endpoint requires encryption
     */
    shouldEncrypt(endpoint) {
        const encryptedEndpoints = [
            '/transactions/',
            '/transfer/',
            '/accounts/',
            '/auth/login/',
            '/auth/change-password/',
            '/profile/update/',
            '/cards/',
            '/beneficiaries/'
        ];
        
        return encryptedEndpoints.some(ep => endpoint.includes(ep));
    }

    /**
     * Determine if endpoint requires crypto signing
     */
    shouldSign(endpoint) {
        const signedEndpoints = [
            '/transactions/',
            '/accounts/',
            '/profile/',
            '/cards/',
            '/beneficiaries/',
            '/auth/logout/',
            '/auth/change-password/'
        ];
        
        return signedEndpoints.some(ep => endpoint.includes(ep));
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `req_${timestamp}_${random}`;
    }

    /**
     * Get authentication token from storage
     */
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    /**
     * Clear authentication token
     */
    clearAuthToken() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }

    /**
     * Smart request method - chooses crypto or regular based on endpoint
     */
    async smartRequest(endpoint, method = 'GET', data = null, options = {}) {
        const requiresCrypto = this.shouldSign(endpoint) || this.shouldEncrypt(endpoint);
        
        if (requiresCrypto) {
            return this.createSecureRequest(endpoint, method, data, options);
        } else {
            return this.createRegularRequest(endpoint, method, data, options);
        }
    }

    /**
     * Convenience methods for different HTTP verbs
     */
    async get(endpoint, options = {}) {
        const response = await this.smartRequest(endpoint, 'GET', null, options);
        return this.handleResponse(response);
    }

    async post(endpoint, data, options = {}) {
        const response = await this.smartRequest(endpoint, 'POST', data, options);
        return this.handleResponse(response);
    }

    async put(endpoint, data, options = {}) {
        const response = await this.smartRequest(endpoint, 'PUT', data, options);
        return this.handleResponse(response);
    }

    async patch(endpoint, data, options = {}) {
        const response = await this.smartRequest(endpoint, 'PATCH', data, options);
        return this.handleResponse(response);
    }

    async delete(endpoint, options = {}) {
        const response = await this.smartRequest(endpoint, 'DELETE', null, options);
        return this.handleResponse(response);
    }

    /**
     * Handle API responses with error checking
     */
    async handleResponse(response) {
        try {
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }
            
            if (!response.ok) {
                // Handle specific crypto errors
                if (data.code === 'INVALID_SIGNATURE') {
                    console.error('🚨 Cryptographic signature validation failed');
                    // Potentially regenerate keys or re-register
                }
                
                throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log(`✅ Response received (${response.status}):`, {
                status: response.status,
                encrypted: response.headers.get('X-Encrypted') === 'true',
                signed: response.headers.get('X-Verified') === 'true'
            });
            
            return data;
        } catch (error) {
            console.error("❌ Response handling failed:", error);
            throw error;
        }
    }

    /**
     * Health check method
     */
    async healthCheck() {
        try {
            const response = await this.createRegularRequest('/health/', 'GET');
            return this.handleResponse(response);
        } catch (error) {
            console.error("❌ Health check failed:", error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * Reset crypto session (for debugging/logout)
     */
    async resetCryptoSession() {
        try {
            await this.cryptoEngine.clearKeys();
            this.isInitialized = false;
            console.log('🔄 Crypto session reset');
            return true;
        } catch (error) {
            console.error("❌ Crypto session reset failed:", error);
            return false;
        }
    }
}

// Create singleton instance
const secureApiClient = new SecureApiClient();
export default secureApiClient;

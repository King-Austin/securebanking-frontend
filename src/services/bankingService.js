/**
 * Banking Service - Secure API interactions
 * Uses SecureCipher for all banking operations
 */

import secureApiClient from '../utils/secureApiClient.js';

class BankingService {
    constructor() {
        this.client = secureApiClient;
    }

    // ==================== AUTHENTICATION ====================

    /**
     * User registration with crypto key setup
     */
    async register(userData) {
        try {
            console.log('🔐 Registering user with crypto support...');
            
            // First register the user
            const response = await this.client.post('/auth/register/', userData);
            
            // If successful, initialize crypto session
            if (response.token) {
                this.client.setAuthToken(response.token);
                await this.client.initializeSession();
            }
            
            return response;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    }

    /**
     * User login with crypto verification
     */
    async login(credentials) {
        try {
            console.log('🔐 Logging in with crypto verification...');
            
            const response = await this.client.post('/auth/login/', credentials);
            
            if (response.token) {
                this.client.setAuthToken(response.token);
                
                // Initialize crypto session for existing user
                try {
                    await this.client.initializeSession();
                } catch (cryptoError) {
                    console.warn('⚠️ Crypto initialization failed during login:', cryptoError);
                    // Continue with login but note crypto issues
                }
            }
            
            return response;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }

    /**
     * Secure logout with crypto cleanup
     */
    async logout() {
        try {
            // Attempt to notify server
            await this.client.post('/auth/logout/', {});
        } catch (error) {
            console.warn('⚠️ Server logout notification failed:', error);
        } finally {
            // Clear local tokens and crypto session
            this.client.clearAuthToken();
            // Note: We don't clear crypto keys as they should persist
        }
    }

    // ==================== ACCOUNT OPERATIONS ====================

    /**
     * Get user's account information (encrypted)
     */
    async getAccount() {
        return await this.client.get('/accounts/me/');
    }

    /**
     * Get account balance (encrypted)
     */
    async getBalance() {
        return await this.client.get('/accounts/balance/');
    }

    /**
     * Get multiple accounts for user
     */
    async getAccounts() {
        return await this.client.get('/accounts/');
    }

    // ==================== TRANSACTION OPERATIONS ====================

    /**
     * Get transaction history (encrypted)
     */
    async getTransactions(page = 1, limit = 20) {
        return await this.client.get(`/transactions/?page=${page}&limit=${limit}`);
    }

    /**
     * Get specific transaction details (encrypted)
     */
    async getTransaction(transactionId) {
        return await this.client.get(`/transactions/${transactionId}/`);
    }

    /**
     * Transfer money (encrypted + signed)
     */
    async transferMoney(transferData) {
        console.log('💸 Processing secure money transfer...');
        
        const payload = {
            recipient_account: transferData.recipientAccount,
            amount: parseFloat(transferData.amount),
            description: transferData.description || '',
            pin: transferData.pin,
            reference: transferData.reference || this.generateReference()
        };
        
        return await this.client.post('/transactions/transfer/', payload);
    }

    /**
     * Internal transfer between user's accounts
     */
    async internalTransfer(transferData) {
        console.log('🔄 Processing internal transfer...');
        
        const payload = {
            from_account: transferData.fromAccount,
            to_account: transferData.toAccount,
            amount: parseFloat(transferData.amount),
            description: transferData.description || 'Internal transfer',
            pin: transferData.pin
        };
        
        return await this.client.post('/transactions/internal-transfer/', payload);
    }

    // ==================== BENEFICIARY OPERATIONS ====================

    /**
     * Get beneficiaries list (encrypted)
     */
    async getBeneficiaries() {
        return await this.client.get('/beneficiaries/');
    }

    /**
     * Add new beneficiary (encrypted)
     */
    async addBeneficiary(beneficiaryData) {
        const payload = {
            account_number: beneficiaryData.accountNumber,
            account_name: beneficiaryData.accountName,
            bank_name: beneficiaryData.bankName,
            nickname: beneficiaryData.nickname || ''
        };
        
        return await this.client.post('/beneficiaries/', payload);
    }

    /**
     * Update beneficiary (encrypted)
     */
    async updateBeneficiary(beneficiaryId, beneficiaryData) {
        return await this.client.put(`/beneficiaries/${beneficiaryId}/`, beneficiaryData);
    }

    /**
     * Delete beneficiary
     */
    async deleteBeneficiary(beneficiaryId) {
        return await this.client.delete(`/beneficiaries/${beneficiaryId}/`);
    }

    // ==================== CARD OPERATIONS ====================

    /**
     * Get user's cards (encrypted)
     */
    async getCards() {
        return await this.client.get('/cards/');
    }

    /**
     * Block/unblock card (signed)
     */
    async toggleCardStatus(cardId, action) {
        const endpoint = action === 'block' ? 'block_card' : 'unblock_card';
        return await this.client.post(`/cards/${cardId}/${endpoint}/`, {});
    }

    /**
     * Update card limits (encrypted)
     */
    async updateCardLimits(cardId, limits) {
        return await this.client.patch(`/cards/${cardId}/`, {
            daily_limit: limits.dailyLimit,
            transaction_limit: limits.transactionLimit
        });
    }

    // ==================== PROFILE OPERATIONS ====================

    /**
     * Get user profile (encrypted)
     */
    async getProfile() {
        return await this.client.get('/user/profile/');
    }

    /**
     * Update user profile (encrypted)
     */
    async updateProfile(profileData) {
        return await this.client.put('/user/profile/', profileData);
    }

    /**
     * Change password (encrypted)
     */
    async changePassword(passwordData) {
        const payload = {
            old_password: passwordData.oldPassword,
            new_password: passwordData.newPassword,
            confirm_password: passwordData.confirmPassword
        };
        
        return await this.client.post('/auth/change-password/', payload);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Generate transaction reference
     */
    generateReference() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `TXN${timestamp}${random}`;
    }

    /**
     * Validate account number format
     */
    validateAccountNumber(accountNumber) {
        // Basic validation - adjust based on your requirements
        const cleaned = accountNumber.replace(/\s+/g, '');
        return /^\d{10}$/.test(cleaned);
    }

    /**
     * Format currency amount
     */
    formatCurrency(amount, currency = 'NGN') {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    /**
     * Health check for API connectivity
     */
    async healthCheck() {
        try {
            return await this.client.healthCheck();
        } catch (error) {
            return { status: 'error', message: 'API connectivity failed' };
        }
    }

    /**
     * Get crypto status for debugging
     */
    async getCryptoStatus() {
        try {
            const hasKeys = await this.client.cryptoEngine.hasKeys();
            const fingerprint = hasKeys ? await this.client.cryptoEngine.getKeyFingerprint() : null;
            
            return {
                hasCryptoKeys: hasKeys,
                fingerprint: fingerprint,
                isInitialized: this.client.isInitialized
            };
        } catch (error) {
            return {
                hasCryptoKeys: false,
                error: error.message
            };
        }
    }

    /**
     * Reset crypto session (for debugging)
     */
    async resetCrypto() {
        return await this.client.resetCryptoSession();
    }
}

// Create singleton instance
const bankingService = new BankingService();
export default bankingService;

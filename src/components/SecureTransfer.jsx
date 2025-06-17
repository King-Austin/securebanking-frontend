/**
 * Example: Secure Transfer Component
 * Demonstrates how to use the SecureCipher system in banking operations
 */

import React, { useState, useEffect } from 'react';
import { useCrypto } from '../contexts/CryptoContext';
import bankingService from '../services/bankingService';

const SecureTransfer = () => {
  const { cryptoReady, keyFingerprint } = useCrypto();
  const [formData, setFormData] = useState({
    recipientAccount: '',
    amount: '',
    description: '',
    pin: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cryptoReady) {
      setError('Cryptographic system not ready. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔐 Starting secure transfer...');
      
      // This will automatically:
      // 1. Sign the request with ECDSA P-384
      // 2. Encrypt sensitive data with AES-256-GCM
      // 3. Add security headers
      // 4. Verify with server
      const response = await bankingService.transferMoney({
        recipientAccount: formData.recipientAccount,
        amount: parseFloat(formData.amount),
        description: formData.description,
        pin: formData.pin
      });

      setResult(response);
      console.log('✅ Secure transfer completed:', response);
      
      // Clear form
      setFormData({
        recipientAccount: '',
        amount: '',
        description: '',
        pin: ''
      });

    } catch (error) {
      console.error('❌ Secure transfer failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="secure-transfer">
      <div className="crypto-indicator">
        <div className={`crypto-status ${cryptoReady ? 'ready' : 'not-ready'}`}>
          <span className="status-dot"></span>
          <span>SecureCipher: {cryptoReady ? 'Active' : 'Inactive'}</span>
          {keyFingerprint && (
            <span className="fingerprint">({keyFingerprint.substr(0, 8)}...)</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transfer-form">
        <h2>🔐 Secure Money Transfer</h2>
        
        <div className="form-group">
          <label htmlFor="recipientAccount">Recipient Account:</label>
          <input
            type="text"
            id="recipientAccount"
            name="recipientAccount"
            value={formData.recipientAccount}
            onChange={handleInputChange}
            placeholder="1234567890"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₦):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="1000.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Payment description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pin">Transaction PIN:</label>
          <input
            type="password"
            id="pin"
            name="pin"
            value={formData.pin}
            onChange={handleInputChange}
            placeholder="••••"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={!cryptoReady || isLoading}
          className="submit-button"
        >
          {isLoading ? '🔐 Processing...' : '💸 Send Money Securely'}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <h4>❌ Transfer Failed</h4>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <h4>✅ Transfer Successful</h4>
          <p><strong>Reference:</strong> {result.reference}</p>
          <p><strong>Amount:</strong> ₦{result.amount}</p>
          <p><strong>Status:</strong> {result.status}</p>
          {result.encrypted && <p>🔒 <em>This transaction was cryptographically secured</em></p>}
        </div>
      )}

      <div className="security-info">
        <h3>🛡️ Security Features Active:</h3>
        <ul>
          <li>✅ ECDSA P-384 Digital Signature</li>
          <li>✅ AES-256-GCM Encryption</li>
          <li>✅ Request Integrity Verification</li>
          <li>✅ Replay Attack Prevention</li>
        </ul>
      </div>

      <style jsx>{`
        .secure-transfer {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .crypto-indicator {
          margin-bottom: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #28a745;
        }

        .crypto-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .crypto-status.ready {
          color: #28a745;
        }

        .crypto-status.not-ready {
          color: #dc3545;
          border-left-color: #dc3545;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        .fingerprint {
          font-family: 'Monaco', monospace;
          font-size: 12px;
          opacity: 0.7;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .transfer-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .transfer-form h2 {
          margin: 0 0 25px 0;
          color: #333;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .submit-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .alert {
          margin: 20px 0;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-error {
          background: #f8d7da;
          border-left-color: #dc3545;
          color: #721c24;
        }

        .alert-success {
          background: #d4edda;
          border-left-color: #28a745;
          color: #155724;
        }

        .alert h4 {
          margin: 0 0 10px 0;
        }

        .alert p {
          margin: 5px 0;
        }

        .security-info {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .security-info h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .security-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .security-info li {
          margin-bottom: 8px;
          color: #555;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .secure-transfer {
            padding: 15px;
          }
          
          .transfer-form {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default SecureTransfer;

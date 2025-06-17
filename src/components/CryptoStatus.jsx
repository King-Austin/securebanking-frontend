/**
 * Crypto Status Component - For debugging and monitoring crypto state
 */

import React, { useState, useEffect } from 'react';
import { useCrypto } from '../contexts/CryptoContext';

const CryptoStatus = ({ isVisible = false }) => {
  const { 
    cryptoReady, 
    cryptoLoading, 
    cryptoError, 
    keyFingerprint,
    getCryptoStatus,
    resetCrypto 
  } = useCrypto();
  
  const [status, setStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isVisible) {
      updateStatus();
    }
  }, [isVisible, cryptoReady, cryptoLoading]);

  const updateStatus = async () => {
    const statusInfo = await getCryptoStatus();
    setStatus(statusInfo);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the crypto session? This will require re-onboarding.')) {
      await resetCrypto();
      await updateStatus();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="crypto-status">
      <div 
        className="crypto-status-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="status-indicator">
          <span className={`status-dot ${cryptoReady ? 'ready' : cryptoLoading ? 'loading' : 'error'}`}></span>
          <span>SecureCipher Status</span>
        </div>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="crypto-status-details">
          <div className="status-grid">
            <div className="status-item">
              <label>Status:</label>
              <span className={`status-value ${cryptoReady ? 'success' : 'error'}`}>
                {cryptoLoading ? 'Loading...' : cryptoReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>

            <div className="status-item">
              <label>Has Keys:</label>
              <span className={`status-value ${status?.hasKeys ? 'success' : 'error'}`}>
                {status?.hasKeys ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="status-item">
              <label>Fingerprint:</label>
              <span className="status-value fingerprint">
                {keyFingerprint || 'None'}
              </span>
            </div>

            <div className="status-item">
              <label>Initialized:</label>
              <span className={`status-value ${status?.isInitialized ? 'success' : 'error'}`}>
                {status?.isInitialized ? 'Yes' : 'No'}
              </span>
            </div>

            {cryptoError && (
              <div className="status-item error-item">
                <label>Error:</label>
                <span className="status-value error">{cryptoError}</span>
              </div>
            )}
          </div>

          <div className="status-actions">
            <button onClick={updateStatus} className="btn-refresh">
              🔄 Refresh
            </button>
            <button onClick={handleReset} className="btn-reset">
              🗑️ Reset Crypto
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .crypto-status {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          z-index: 9999;
          min-width: 280px;
        }

        .crypto-status-header {
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }

        .crypto-status-header:hover {
          background: #e9ecef;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.ready {
          background: #28a745;
          animation: pulse 2s infinite;
        }

        .status-dot.loading {
          background: #ffc107;
          animation: blink 1s infinite;
        }

        .status-dot.error {
          background: #dc3545;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .toggle-icon {
          color: #666;
          font-size: 10px;
        }

        .crypto-status-details {
          padding: 16px;
        }

        .status-grid {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }

        .status-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: center;
        }

        .status-item label {
          font-weight: 600;
          color: #555;
        }

        .status-value {
          font-family: inherit;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
        }

        .status-value.success {
          background: #d4edda;
          color: #155724;
        }

        .status-value.error {
          background: #f8d7da;
          color: #721c24;
        }

        .status-value.fingerprint {
          background: #e2e3e5;
          color: #383d41;
          font-family: 'Monaco', monospace;
          font-size: 10px;
          word-break: break-all;
        }

        .error-item {
          grid-column: 1 / -1;
        }

        .error-item .status-value {
          grid-column: 1 / -1;
          font-size: 10px;
          word-break: break-word;
        }

        .status-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }

        .status-actions button {
          flex: 1;
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .btn-reset:hover {
          background: #dc3545;
          color: white;
          border-color: #dc3545;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .crypto-status {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoStatus;

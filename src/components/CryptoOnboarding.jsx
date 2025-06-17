/**
 * Crypto Onboarding Component
 * Handles user's initial cryptographic setup
 */

import React, { useState, useEffect } from 'react';
import SecureCipherEngine from '../utils/cryptoEngine.js';

const CryptoOnboarding = ({ onComplete }) => {
    const [status, setStatus] = useState('checking');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [cryptoEngine] = useState(new SecureCipherEngine());
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        initializeCrypto();
    }, []);

    const initializeCrypto = async () => {
        try {
            setError(null);
            setStatus('checking');
            setProgress(10);
            setStatusMessage('Checking existing cryptographic keys...');

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Check if keys already exist
            const hasKeys = await cryptoEngine.hasKeys();
            
            if (hasKeys) {
                setStatus('keys-found');
                setProgress(90);
                setStatusMessage('Existing cryptographic keys found!');
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                setProgress(100);
                setStatusMessage('Cryptographic setup verified!');
                
                setTimeout(() => onComplete(true), 1500);
                return;
            }

            // Generate new keys
            setStatus('generating');
            setProgress(30);
            setStatusMessage('Generating ECDSA P-384 key pair...');
            
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            const keyPair = await cryptoEngine.generateKeyPair();
            if (!keyPair) {
                throw new Error('Key generation returned null');
            }
            
            setProgress(60);
            setStatusMessage('Securing keys in IndexedDB...');
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Verify key storage
            setStatus('verifying');
            setProgress(80);
            setStatusMessage('Verifying cryptographic setup...');
            
            const storedKey = await cryptoEngine.getPrivateKey();
            const publicKey = await cryptoEngine.getPublicKeyJWK();
            const fingerprint = await cryptoEngine.getKeyFingerprint();
            
            if (!storedKey || !publicKey || !fingerprint) {
                throw new Error('Key verification failed - keys not properly stored');
            }
            
            setProgress(100);
            setStatus('complete');
            setStatusMessage('Cryptographic setup complete!');
            
            setTimeout(() => onComplete(true), 2000);
            
        } catch (error) {
            console.error('❌ Crypto initialization failed:', error);
            setError(error.message);
            setStatus('error');
            setStatusMessage('Setup failed. Please try again.');
        }
    };

    const retrySetup = async () => {
        // Clear any existing keys before retry
        try {
            await cryptoEngine.clearKeys();
        } catch (e) {
            console.warn('Key clearing failed:', e);
        }
        
        setError(null);
        setProgress(0);
        initializeCrypto();
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'checking':
                return '🔍';
            case 'generating':
                return '🔐';
            case 'verifying':
                return '🛡️';
            case 'keys-found':
                return '✅';
            case 'complete':
                return '🎉';
            case 'error':
                return '❌';
            default:
                return '⚡';
        }
    };

    const getProgressColor = () => {
        if (error) return '#f44336';
        if (progress === 100) return '#4caf50';
        return '#2196f3';
    };

    return (
        <div className="crypto-onboarding">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="crypto-icon">{getStatusIcon()}</div>
                    <h2>SecureCipher Banking</h2>
                    <p>Initializing your cryptographic security layer</p>
                </div>

                <div className="progress-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ 
                                width: `${progress}%`,
                                backgroundColor: getProgressColor()
                            }}
                        ></div>
                    </div>
                    <p className="progress-text">{progress}%</p>
                </div>

                <div className="status-message">
                    <p>{statusMessage}</p>
                </div>

                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={retrySetup} className="retry-button">
                            🔄 Try Again
                        </button>
                    </div>
                )}

                <div className="security-info">
                    <h4>🛡️ Security Features:</h4>
                    <ul>
                        <li>✅ ECDSA P-384 Digital Signatures</li>
                        <li>✅ AES-256-GCM Encryption</li>
                        <li>✅ Secure Key Storage (IndexedDB)</li>
                        <li>✅ Request-Response Integrity</li>
                        <li>✅ Replay Attack Prevention</li>
                    </ul>
                </div>

                <div className="tech-details">
                    <details>
                        <summary>🔧 Technical Details</summary>
                        <div className="tech-content">
                            <p><strong>Elliptic Curve:</strong> NIST P-384 (secp384r1)</p>
                            <p><strong>Hash Algorithm:</strong> SHA-384</p>
                            <p><strong>Encryption:</strong> AES-256-GCM</p>
                            <p><strong>Key Storage:</strong> Browser IndexedDB</p>
                            <p><strong>Security Level:</strong> ≈ 192-bit symmetric</p>
                        </div>
                    </details>
                </div>
            </div>

            <style jsx>{`
                .crypto-onboarding {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .onboarding-container {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    text-align: center;
                    max-width: 550px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .onboarding-header {
                    margin-bottom: 30px;
                }

                .crypto-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .onboarding-header h2 {
                    color: #333;
                    margin: 0 0 10px 0;
                    font-size: 2.2rem;
                    font-weight: 700;
                }

                .onboarding-header p {
                    color: #666;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .progress-container {
                    margin: 35px 0;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: #f0f0f0;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 15px;
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    background: #2196f3;
                    transition: width 0.5s ease, background-color 0.3s ease;
                    border-radius: 6px;
                    position: relative;
                }

                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-text {
                    color: #666;
                    font-weight: bold;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .status-message {
                    margin: 25px 0;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .status-message p {
                    color: #333;
                    font-weight: 500;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .error-container {
                    background: #ffebee;
                    border: 1px solid #ffcdd2;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                }

                .error-message {
                    color: #c62828;
                    margin: 0 0 15px 0;
                    font-weight: 500;
                }

                .retry-button {
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: background-color 0.3s ease;
                }

                .retry-button:hover {
                    background: #d32f2f;
                }

                .security-info {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: left;
                }

                .security-info h4 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.2rem;
                }

                .security-info ul {
                    margin: 0;
                    padding-left: 20px;
                    list-style: none;
                }

                .security-info li {
                    color: #555;
                    margin-bottom: 8px;
                    position: relative;
                    padding-left: 0;
                }

                .tech-details {
                    margin-top: 20px;
                    text-align: left;
                }

                .tech-details summary {
                    cursor: pointer;
                    color: #666;
                    font-weight: 500;
                    padding: 10px;
                    border-radius: 8px;
                    background: #f5f5f5;
                    margin-bottom: 10px;
                }

                .tech-details summary:hover {
                    background: #eee;
                }

                .tech-content {
                    padding: 15px;
                    background: #fafafa;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                .tech-content p {
                    margin: 8px 0;
                    color: #555;
                }

                .tech-content strong {
                    color: #333;
                }

                /* Mobile responsiveness */
                @media (max-width: 480px) {
                    .onboarding-container {
                        padding: 25px;
                        border-radius: 16px;
                    }
                    
                    .onboarding-header h2 {
                        font-size: 1.8rem;
                    }
                    
                    .crypto-icon {
                        font-size: 3rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CryptoOnboarding;

/**
 * Crypto Context - Manages cryptographic state across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import secureApiClient from '../utils/secureApiClient.js';

const CryptoContext = createContext();

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

export const CryptoProvider = ({ children }) => {
  const [cryptoReady, setCryptoReady] = useState(false);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState(null);
  const [keyFingerprint, setKeyFingerprint] = useState(null);

  useEffect(() => {
    initializeCrypto();
  }, []);

  const initializeCrypto = async () => {
    try {
      setCryptoLoading(true);
      setCryptoError(null);

      console.log('🔐 Initializing crypto context...');

      // Check if crypto keys exist
      const hasKeys = await secureApiClient.cryptoEngine.hasKeys();
      
      if (hasKeys) {
        // Initialize session and get fingerprint
        await secureApiClient.initializeSession();
        const fingerprint = await secureApiClient.cryptoEngine.getKeyFingerprint();
        
        setKeyFingerprint(fingerprint);
        setCryptoReady(true);
        
        console.log('✅ Crypto context initialized with existing keys');
      } else {
        setCryptoReady(false);
        console.log('⚠️ No crypto keys found - onboarding required');
      }
    } catch (error) {
      console.error('❌ Crypto initialization failed:', error);
      setCryptoError(error.message);
      setCryptoReady(false);
    } finally {
      setCryptoLoading(false);
    }
  };

  const completeCryptoSetup = async () => {
    try {
      setCryptoLoading(true);
      
      // Initialize session after key generation
      await secureApiClient.initializeSession();
      const fingerprint = await secureApiClient.cryptoEngine.getKeyFingerprint();
      
      setKeyFingerprint(fingerprint);
      setCryptoReady(true);
      setCryptoError(null);
      
      console.log('✅ Crypto setup completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Crypto setup completion failed:', error);
      setCryptoError(error.message);
      return false;
    } finally {
      setCryptoLoading(false);
    }
  };

  const resetCrypto = async () => {
    try {
      setCryptoLoading(true);
      
      await secureApiClient.resetCryptoSession();
      
      setKeyFingerprint(null);
      setCryptoReady(false);
      setCryptoError(null);
      
      console.log('🔄 Crypto session reset');
      return true;
    } catch (error) {
      console.error('❌ Crypto reset failed:', error);
      setCryptoError(error.message);
      return false;
    } finally {
      setCryptoLoading(false);
    }
  };

  const getCryptoStatus = async () => {
    try {
      const hasKeys = await secureApiClient.cryptoEngine.hasKeys();
      const fingerprint = hasKeys ? await secureApiClient.cryptoEngine.getKeyFingerprint() : null;
      
      return {
        hasKeys,
        fingerprint,
        isReady: cryptoReady,
        isInitialized: secureApiClient.isInitialized
      };
    } catch (error) {
      return {
        hasKeys: false,
        fingerprint: null,
        isReady: false,
        error: error.message
      };
    }
  };

  const value = {
    // State
    cryptoReady,
    cryptoLoading,
    cryptoError,
    keyFingerprint,
    
    // Actions
    initializeCrypto,
    completeCryptoSetup,
    resetCrypto,
    getCryptoStatus,
    
    // Utilities
    secureApiClient
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};

export default CryptoContext;

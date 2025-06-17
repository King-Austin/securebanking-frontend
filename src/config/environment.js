/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

// Environment variables with fallbacks
export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  MIDDLEWARE_URL: import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:8001/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SecureCipher Bank',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Secure Digital Banking Platform',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Security
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV,
  
  // Features
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  
  // UI Configuration
  DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY || 'NGN',
  CURRENCY_SYMBOL: import.meta.env.VITE_CURRENCY_SYMBOL || '₦',
  
  // Contact Information
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@securecipher.com',
  SUPPORT_PHONE: import.meta.env.VITE_SUPPORT_PHONE || '+234-800-SECURE',
};

// Validation function
export const validateConfig = () => {
  const requiredVars = [
    'API_URL',
    'APP_NAME',
  ];
  
  const missing = requiredVars.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate API URL format
  try {
    new URL(config.API_URL);
  } catch (error) {
    throw new Error(`Invalid API_URL format: ${config.API_URL}`);
  }
  
  return true;
};

// Debug function for development
export const debugConfig = () => {
  if (config.ENABLE_DEBUG) {
    console.group('🔧 App Configuration');
    console.table(config);
    console.groupEnd();
  }
};

// Export individual configurations for convenience
export const {
  API_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  ENABLE_DEBUG,
  ENABLE_ANALYTICS,
  ENABLE_ERROR_REPORTING,
  DEFAULT_LANGUAGE,
  DEFAULT_CURRENCY,
  CURRENCY_SYMBOL,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} = config;

// Currency configuration object
export const CURRENCY_CONFIG = {
  code: DEFAULT_CURRENCY,
  symbol: CURRENCY_SYMBOL,
  locale: 'en-NG'
};

export default config;

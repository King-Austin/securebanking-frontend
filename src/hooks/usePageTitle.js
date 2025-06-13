import { useEffect } from 'react';

/**
 * Custom hook to manage page title dynamically
 * @param {string} title - The page-specific title
 * @param {string} defaultTitle - The default site title (optional)
 */
export const usePageTitle = (title, defaultTitle = 'SecureCipher Bank') => {
  useEffect(() => {
    const previousTitle = document.title;
    
    // Set the new title
    if (title) {
      document.title = `${title} | ${defaultTitle}`;
    } else {
      document.title = defaultTitle;
    }
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, defaultTitle]);
};

/**
 * Get page title based on route/page name
 * @param {string} pageName - The current page name
 * @returns {string} - The formatted page title
 */
export const getPageTitle = (pageName) => {
  const titleMap = {
    dashboard: 'Dashboard',
    accounts: 'My Accounts',
    transactions: 'Transaction History',
    transfer: 'Transfer Money',
    beneficiaries: 'Beneficiaries',
    cards: 'My Cards',
    profile: 'Profile Settings',
    login: 'Login',
    register: 'Create Account',
    'account-details': 'Account Details',
    'transfer-success': 'Transfer Successful',
    'transfer-failed': 'Transfer Failed',
    settings: 'Settings',
    help: 'Help & Support',
    notifications: 'Notifications',
  };
  
  return titleMap[pageName] || '';
};

export default usePageTitle;

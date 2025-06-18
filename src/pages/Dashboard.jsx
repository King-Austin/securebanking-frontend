import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCrypto } from '../contexts/CryptoContext';
import bankingService from '../services/bankingService.js';
import { testBackendConnection, forceApiCall } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePageTitle } from '../hooks/usePageTitle';

const Dashboard = () => {
  const { user } = useAuth();
  const { cryptoReady, keyFingerprint } = useCrypto();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Set page title
  usePageTitle('Dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [accountsRes, transactionsRes] = await Promise.all([
        bankingService.getAccounts().catch(err => ({ results: [] })),
        bankingService.getTransactions({ limit: 5, ordering: '-created_at' }).catch(err => ({ results: [] }))
      ]);
      
      setAccounts(accountsRes.results || accountsRes || []);
      setRecentTransactions((transactionsRes.results || transactionsRes || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount || 0).replace('NGN', '₦');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);

  // Test backend connection function
  const handleTestBackend = async () => {
    try {
      await testBackendConnection();
      alert('✅ Backend connection successful! Check console and backend logs.');
    } catch (error) {
      alert('❌ Backend connection failed: ' + error.message);
    }
  };

  // Force API call function
  const handleForceApiCall = async () => {
    try {
      await forceApiCall('/health/');
      alert('✅ Health check successful! Check backend logs.');
    } catch (error) {
      alert('❌ Health check failed: ' + error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      {/* Debug Panel - Remove after fixing backend connectivity */}
      <div className="alert alert-info mb-4" role="alert">
        <h6 className="alert-heading">🔧 Debug Panel - Backend Testing</h6>
        <p className="mb-2">Use these buttons to test backend connectivity and generate logs:</p>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-primary" 
            onClick={handleTestBackend}
          >
            🧪 Test Backend Connection
          </button>
          <button 
            className="btn btn-sm btn-success" 
            onClick={handleForceApiCall}
          >
            ❤️ Health Check
          </button>
        </div>
        <small className="text-muted">These bypass crypto and hit your backend directly.</small>
      </div>

      {/* Header with Refresh Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Dashboard</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={handleRefresh}
          >
            Retry
          </button>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="banking-gradient rounded-3 p-4 p-md-5 text-white mb-4">
        <div className="row align-items-start">
          <div className="col-md-8">
            <h1 className="display-6 fw-bold mb-2">
              Welcome back, {user?.first_name || user?.username || 'User'}!
            </h1>
            <p className="text-white-50 mb-0">
              Here's what's happening with your accounts today.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <p className="text-white-50 mb-1">Total Balance</p>
            <div className="d-flex align-items-center justify-content-md-end">
              <span className="display-6 fw-bold me-2">
                {balanceVisible ? formatCurrency(totalBalance) : '••••••'}
              </span>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="btn btn-link text-white-50 p-0"
              >
                <i className={`bi ${balanceVisible ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 fw-bold text-dark mb-0">Your Accounts</h2>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="btn btn-outline-secondary btn-sm"
          >
            <i className={`bi ${balanceVisible ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
            {balanceVisible ? 'Hide' : 'Show'} Balances
          </button>
        </div>
        
        {accounts.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-3 p-5">
              <i className="bi bi-bank text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="mt-3 text-muted">No Accounts Found</h4>
              <p className="text-muted mb-4">
                {error ? 'Unable to load accounts. Please try refreshing.' : 'You don\'t have any accounts yet. Contact your branch to open an account.'}
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-banking" onClick={handleRefresh}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {accounts.map((account) => (
              <div key={account.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card card-banking h-100" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/accounts')}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                          <i className="bi bi-credit-card text-primary fs-5"></i>
                        </div>
                        <div>
                          <h5 className="card-title mb-1 fw-semibold">
                            {account.account_type?.name || account.account_type_name || 'Account'}
                          </h5>
                          <p className="text-muted small mb-0">
                            ****{account.account_number?.slice(-4) || '0000'}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${
                        account.is_active || account.status === 'ACTIVE' 
                          ? 'bg-success' 
                          : 'bg-danger'
                      }`}>
                        {account.is_active || account.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted">Available Balance</small>
                        <div className="fw-semibold">
                          {balanceVisible ? formatCurrency(account.available_balance || account.balance) : '••••••'}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Current Balance</small>
                        <div className="fw-semibold">
                          {balanceVisible ? formatCurrency(account.balance) : '••••••'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="mb-5">
        <h2 className="h3 fw-bold text-dark mb-4">Recent Transactions</h2>
        <div className="card card-banking">
          <div className="card-body">
            {recentTransactions.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">No recent transactions</p>
            ) : (
              <div className="list-group list-group-flush">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="list-group-item border-0 px-0 py-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/transactions')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className={`p-2 rounded-circle me-3 ${
                          transaction.transaction_type === 'CREDIT' 
                            ? 'bg-success bg-opacity-10' 
                            : 'bg-danger bg-opacity-10'
                        }`}>
                          <i className={`bi ${
                            transaction.transaction_type === 'CREDIT' 
                              ? 'bi-arrow-down text-success' 
                              : 'bi-arrow-up text-danger'
                          }`}></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-medium">
                            {transaction.description}
                          </h6>
                          <small className="text-muted">
                            {formatDate(transaction.created_at)} • {transaction.category_name}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className={`fw-semibold ${
                          transaction.transaction_type === 'CREDIT' 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <small className="text-muted">
                          Ref: {transaction.reference_number}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center pt-3">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/transactions')}
              >
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h2 className="h3 fw-bold text-dark mb-4">Quick Actions</h2>
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div 
              className="card card-banking h-100 border-0 text-start" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/transfer')}
            >
              <div className="card-body">
                <div className="bg-info bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-arrow-up text-info fs-4"></i>
                </div>
                <h5 className="card-title fw-semibold mb-2">Transfer Money</h5>
                <p className="card-text text-muted small">Send money to accounts and beneficiaries</p>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-md-4">
            <div 
              className="card card-banking h-100 border-0 text-start" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/cards')}
            >
              <div className="card-body">
                <div className="bg-success bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-credit-card text-success fs-4"></i>
                </div>
                <h5 className="card-title fw-semibold mb-2">View Cards</h5>
                <p className="card-text text-muted small">Manage your debit and credit cards</p>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-md-4">
            <div 
              className="card card-banking h-100 border-0 text-start" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/transactions')}
            >
              <div className="card-body">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-clock-history text-warning fs-4"></i>
                </div>
                <h5 className="card-title fw-semibold mb-2">Transaction History</h5>
                <p className="card-text text-muted small">View all your transaction history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

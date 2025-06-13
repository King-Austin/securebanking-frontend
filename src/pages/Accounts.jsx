import { useState, useEffect } from 'react';
import { accountAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Your Accounts</h1>
        <button
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="btn btn-outline-secondary"
        >
          <i className={`bi ${balanceVisible ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
          {balanceVisible ? 'Hide' : 'Show'} Balances
        </button>
      </div>

      <div className="row g-4">
        {accounts.map((account) => (
          <div key={account.id} className="col-12 col-md-6 col-lg-4">
            <div className="card card-banking h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                      <i className="bi bi-credit-card text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-1 fw-bold">
                        {account.account_type_name}
                      </h5>
                      <p className="text-muted small mb-0">
                        Account: ****{account.account_number.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${
                    account.status === 'ACTIVE' 
                      ? 'bg-success' 
                      : account.status === 'INACTIVE'
                      ? 'bg-warning'
                      : 'bg-danger'
                  }`}>
                    {account.status}
                  </span>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <small className="text-muted d-block">Available Balance</small>
                      <div className="fw-bold text-success fs-5">
                        {balanceVisible ? formatCurrency(account.available_balance) : '••••••'}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <small className="text-muted d-block">Current Balance</small>
                      <div className="fw-bold fs-5">
                        {balanceVisible ? formatCurrency(account.balance) : '••••••'}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="row g-2 small text-muted">
                  <div className="col-6">
                    <strong>Account Type:</strong><br />
                    {account.account_type_name}
                  </div>
                  <div className="col-6">
                    <strong>Opened:</strong><br />
                    {formatDate(account.created_at)}
                  </div>
                  <div className="col-6">
                    <strong>Currency:</strong><br />
                    USD
                  </div>
                  <div className="col-6">
                    <strong>Branch:</strong><br />
                    Main Branch
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-eye me-1"></i>
                    View Details
                  </button>
                  <button className="btn btn-banking btn-sm">
                    <i className="bi bi-arrow-up-right me-1"></i>
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-5">
          <div className="bg-light rounded-3 p-5">
            <i className="bi bi-credit-card text-muted" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3 text-muted">No Accounts Found</h4>
            <p className="text-muted mb-4">You don't have any accounts yet. Contact your branch to open an account.</p>
            <button className="btn btn-banking">
              <i className="bi bi-plus-circle me-2"></i>
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

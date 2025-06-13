import { useState, useEffect } from 'react';
import { accountAPI, transactionAPI } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [transferData, setTransferData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    description: '',
    transfer_type: 'internal'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Set page title
  usePageTitle('Transfer Money');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!transferData.from_account || !transferData.to_account || !transferData.amount || !transferData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (parseFloat(transferData.amount) <= 0) {
        throw new Error('Transfer amount must be greater than 0');
      }

      if (selectedFromAccount && parseFloat(transferData.amount) > parseFloat(selectedFromAccount.available_balance || selectedFromAccount.balance)) {
        throw new Error('Insufficient funds for this transfer');
      }

      // Prepare transfer data for API
      const transferPayload = {
        from_account: transferData.from_account,
        to_account: transferData.to_account,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
        transfer_type: transferData.transfer_type
      };

      // Call transfer API
      const response = await transactionAPI.transfer(transferPayload);
      
      setSuccess(`Transfer completed successfully! Reference: ${response.data.reference_number || 'N/A'}`);
      
      // Reset form
      setTransferData({
        from_account: '',
        to_account: '',
        amount: '',
        description: '',
        transfer_type: 'internal'
      });
      
      // Refresh accounts data
      fetchAccounts();
      
    } catch (error) {
      console.error('Transfer error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          error.response?.data?.amount?.[0] ||
                          error.response?.data?.from_account?.[0] ||
                          error.response?.data?.to_account?.[0] ||
                          error.message ||
                          'Transfer failed. Please try again.';
      setError(errorMessage);
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

  const selectedFromAccount = accounts.find(acc => acc.id.toString() === transferData.from_account);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-8">
          <h1 className="h2 fw-bold text-dark mb-4">Transfer Money</h1>

          {/* Transfer Form */}
          <div className="card card-banking">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                <div className="row g-4">
                  <div className="col-md-6">
                    <label htmlFor="transfer_type" className="form-label fw-medium">
                      Transfer Type
                    </label>
                    <select
                      id="transfer_type"
                      name="transfer_type"
                      className="form-select"
                      value={transferData.transfer_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="internal">Between My Accounts</option>
                      <option value="external">To Another Bank</option>
                      <option value="beneficiary">To Saved Beneficiary</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="from_account" className="form-label fw-medium">
                      From Account
                    </label>
                    <select
                      id="from_account"
                      name="from_account"
                      className="form-select"
                      value={transferData.from_account}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select source account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_type_name} - ****{account.account_number.slice(-4)} 
                          ({formatCurrency(account.available_balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="to_account" className="form-label fw-medium">
                      {transferData.transfer_type === 'internal' ? 'To Account' : 'Recipient Account'}
                    </label>
                    {transferData.transfer_type === 'internal' ? (
                      <select
                        id="to_account"
                        name="to_account"
                        className="form-select"
                        value={transferData.to_account}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select destination account</option>
                        {accounts
                          .filter(acc => acc.id.toString() !== transferData.from_account)
                          .map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.account_type_name} - ****{account.account_number.slice(-4)}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="to_account"
                        name="to_account"
                        className="form-control"
                        placeholder="Enter account number"
                        value={transferData.to_account}
                        onChange={handleChange}
                        required
                      />
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="amount" className="form-label fw-medium">
                      Amount
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        className="form-control"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        value={transferData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {selectedFromAccount && transferData.amount && (
                      <small className="text-muted">
                        Available: {formatCurrency(selectedFromAccount.available_balance)}
                      </small>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      rows="3"
                      placeholder="Enter transfer description..."
                      value={transferData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Transfer Summary</h6>
                    <small className="text-muted">Please review your transfer details</small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold fs-4 text-primary">
                      {transferData.amount ? formatCurrency(transferData.amount) : '₦0.00'}
                    </div>
                    <small className="text-muted">Transfer Amount</small>
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button type="button" className="btn btn-outline-secondary">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-banking"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Transfer Money
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Quick Transfer Options */}
            <div className="card card-banking mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-lightning me-2"></i>
                  Quick Transfers
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Repeat Last Transfer
                  </button>
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-people me-2"></i>
                    Transfer to Beneficiary
                  </button>
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-calendar-check me-2"></i>
                    Schedule Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="card border-warning">
              <div className="card-body">
                <h6 className="card-title text-warning">
                  <i className="bi bi-shield-check me-2"></i>
                  Security Notice
                </h6>
                <ul className="list-unstyled small mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check text-success me-2"></i>
                    All transfers are encrypted
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check text-success me-2"></i>
                    Two-factor authentication
                  </li>
                  <li className="mb-0">
                    <i className="bi bi-check text-success me-2"></i>
                    Real-time fraud monitoring
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

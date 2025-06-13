import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.transaction_type.toLowerCase() === filter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Transaction History</h1>
        <button className="btn btn-banking">
          <i className="bi bi-download me-2"></i>
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="credit">Credits Only</option>
            <option value="debit">Debits Only</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card card-banking">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-3 d-inline-block mb-2">
                <i className="bi bi-arrow-down text-success fs-4"></i>
              </div>
              <h5 className="card-title">Total Credits</h5>
              <p className="card-text fs-4 fw-bold text-success">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.transaction_type === 'CREDIT')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-banking">
            <div className="card-body text-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-3 d-inline-block mb-2">
                <i className="bi bi-arrow-up text-danger fs-4"></i>
              </div>
              <h5 className="card-title">Total Debits</h5>
              <p className="card-text fs-4 fw-bold text-danger">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.transaction_type === 'DEBIT')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-banking">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-3 d-inline-block mb-2">
                <i className="bi bi-list-ul text-info fs-4"></i>
              </div>
              <h5 className="card-title">Total Transactions</h5>
              <p className="card-text fs-4 fw-bold text-info">
                {filteredTransactions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card card-banking">
        <div className="card-body">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="mt-3 text-muted">No Transactions Found</h4>
              <p className="text-muted">No transactions match your current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <small className="text-muted">
                          {formatDate(transaction.created_at)}
                        </small>
                      </td>
                      <td>
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
                            <div className="fw-medium">{transaction.description}</div>
                            <small className="text-muted">Account: ****{transaction.account_number?.slice(-4) || '0000'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {transaction.category_name}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted font-monospace">
                          {transaction.reference_number}
                        </small>
                      </td>
                      <td>
                        <span className={`fw-bold ${
                          transaction.transaction_type === 'CREDIT' 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          transaction.status === 'COMPLETED' 
                            ? 'bg-success' 
                            : transaction.status === 'PENDING'
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

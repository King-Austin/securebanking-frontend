import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { cardAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { CURRENCY_CONFIG } from '../config/environment';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner';

export default function Cards() {
  // Set page title
  usePageTitle('My Cards');

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [showCardNumbers, setShowCardNumbers] = useState({});

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cardAPI.getCards();
      setCards(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError(error.response?.data?.message || 'Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = async (cardId, action, actionData = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [cardId]: action }));
      setError('');

      let response;
      switch (action) {
        case 'block':
          response = await cardAPI.blockCard(cardId);
          break;
        case 'unblock':
          response = await cardAPI.unblockCard(cardId);
          break;
        case 'report':
          response = await cardAPI.reportLostStolen(cardId, actionData.reason);
          break;
        default:
          throw new Error('Unknown action');
      }

      // Update card status in local state
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, status: action === 'block' ? 'BLOCKED' : 'ACTIVE' }
          : card
      ));

    } catch (error) {
      console.error(`Error performing ${action} on card:`, error);
      setError(error.response?.data?.message || `Failed to ${action} card. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [cardId]: false }));
    }
  };

  const formatCardNumber = (number, show = false) => {
    if (!number) return '****';
    if (show) {
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return `**** **** **** ${number.slice(-4)}`;
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return '**/**';
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
  };

  const toggleCardVisibility = (cardId) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getCardTypeColor = (cardType) => {
    switch (cardType?.toUpperCase()) {
      case 'CREDIT':
        return 'banking-gradient';
      case 'DEBIT':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success';
      case 'BLOCKED':
        return 'bg-danger';
      case 'EXPIRED':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your cards..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Your Cards</h1>
        <button className="btn btn-banking">
          <i className="bi bi-plus-circle me-2"></i>
          Request New Card
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchCards}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {cards.length === 0 && !loading && (
        <div className="text-center py-5">
          <div className="bg-light p-4 rounded-3 d-inline-block mb-3">
            <i className="bi bi-credit-card text-muted fs-1"></i>
          </div>
          <h5 className="text-muted">No Cards Found</h5>
          <p className="text-muted">You don't have any cards yet. Request your first card to get started.</p>
          <button className="btn btn-banking">
            <i className="bi bi-plus-circle me-2"></i>
            Request New Card
          </button>
        </div>
      )}

      <div className="row g-4">
        {cards.map((card) => (
          <div key={card.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              {/* Card Visual */}
              <div className={`card-img-top p-4 text-white position-relative ${getCardTypeColor(card.card_type)}`} style={{ minHeight: '200px' }}>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h6 className="text-white-50 mb-1">SecureCipher Bank</h6>
                    <span className="badge bg-white text-dark">
                      {card.card_type || 'CARD'}
                    </span>
                  </div>
                  <button
                    className="btn btn-link text-white p-0"
                    onClick={() => toggleCardVisibility(card.id)}
                    disabled={actionLoading[card.id]}
                  >
                    <i className={`bi ${showCardNumbers[card.id] ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                  </button>
                </div>

                <div className="position-absolute bottom-0 start-0 p-4 w-100">
                  <div className="mb-3">
                    <div className="font-monospace fs-5 fw-bold">
                      {formatCardNumber(card.card_number, showCardNumbers[card.id])}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-8">
                      <small className="text-white-50 d-block">CARD HOLDER</small>
                      <div className="fw-medium">{card.card_holder_name || 'CARD HOLDER'}</div>
                    </div>
                    <div className="col-4 text-end">
                      <small className="text-white-50 d-block">EXPIRES</small>
                      <div className="fw-medium">{formatExpiryDate(card.expiry_date)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="card-title mb-0">
                    {card.card_type || 'Card'}
                  </h6>
                  <span className={`badge ${getStatusBadgeClass(card.status)}`}>
                    {card.status || 'UNKNOWN'}
                  </span>
                </div>

                {card.card_type?.toUpperCase() === 'CREDIT' && card.credit_limit && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Available Credit</small>
                      <span className="fw-bold text-success">
                        {formatCurrency(card.available_credit || 0)}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ 
                          width: `${card.credit_limit ? (card.available_credit / card.credit_limit) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Limit: {formatCurrency(card.credit_limit)}
                    </small>
                  </div>
                )}

                {card.account_type && (
                  <div className="mb-3">
                    <small className="text-muted">Linked Account</small>
                    <div className="fw-medium">{card.account_type}</div>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <div className="btn-group" role="group">
                    <button 
                      className={`btn btn-outline-${card.status === 'BLOCKED' ? 'success' : 'warning'} btn-sm`}
                      onClick={() => handleCardAction(card.id, card.status === 'BLOCKED' ? 'unblock' : 'block')}
                      disabled={actionLoading[card.id]}
                    >
                      {actionLoading[card.id] === (card.status === 'BLOCKED' ? 'unblock' : 'block') ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <i className={`bi ${card.status === 'BLOCKED' ? 'bi-unlock' : 'bi-lock'}`}></i>
                      )}
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-gear"></i>
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleCardAction(card.id, 'report', { reason: 'lost' })}
                      disabled={actionLoading[card.id]}
                    >
                      {actionLoading[card.id] === 'report' ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <i className="bi bi-exclamation-triangle"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Actions */}
      {cards.length > 0 && (
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <div className="card card-banking h-100">
              <div className="card-body text-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-shield-lock text-primary fs-4"></i>
                </div>
                <h5 className="card-title">Block/Unblock Card</h5>
                <p className="card-text text-muted small">Temporarily block your card for security</p>
                <button className="btn btn-outline-primary">
                  Manage Security
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-banking h-100">
              <div className="card-body text-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-pin text-info fs-4"></i>
                </div>
                <h5 className="card-title">Change PIN</h5>
                <p className="card-text text-muted small">Update your card PIN for ATM and POS</p>
                <button className="btn btn-outline-info">
                  Change PIN
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-banking h-100">
              <div className="card-body text-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3 d-inline-block mb-3">
                  <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                </div>
                <h5 className="card-title">Report Lost/Stolen</h5>
                <p className="card-text text-muted small">Report your card if lost or stolen</p>
                <button className="btn btn-outline-warning">
                  Report Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

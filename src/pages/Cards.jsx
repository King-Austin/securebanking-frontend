import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Cards() {
  // Set page title
  usePageTitle('My Cards');

  const [cards, setCards] = useState([
    {
      id: 1,
      card_number: '4567890123456789',
      card_type: 'DEBIT',
      status: 'ACTIVE',
      expiry_date: '2027-12-31',
      card_holder_name: 'JOHN DOE',
      account_id: 1,
      account_type: 'Checking Account'
    },
    {
      id: 2,
      card_number: '5234567890123456',
      card_type: 'CREDIT',
      status: 'ACTIVE',
      expiry_date: '2026-06-30',
      card_holder_name: 'JOHN DOE',
      credit_limit: 5000,
      available_credit: 4200
    }
  ]);
  const [showCardNumbers, setShowCardNumbers] = useState({});

  const formatCardNumber = (number, show = false) => {
    if (show) {
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return `**** **** **** ${number.slice(-4)}`;
  };

  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleCardVisibility = (cardId) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Your Cards</h1>
        <button className="btn btn-banking">
          <i className="bi bi-plus-circle me-2"></i>
          Request New Card
        </button>
      </div>

      <div className="row g-4">
        {cards.map((card) => (
          <div key={card.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              {/* Card Visual */}
              <div className={`card-img-top p-4 text-white position-relative ${
                card.card_type === 'CREDIT' ? 'banking-gradient' : 'bg-dark'
              }`} style={{ minHeight: '200px' }}>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h6 className="text-white-50 mb-1">SecureCipher Bank</h6>
                    <span className="badge bg-white text-dark">
                      {card.card_type}
                    </span>
                  </div>
                  <button
                    className="btn btn-link text-white p-0"
                    onClick={() => toggleCardVisibility(card.id)}
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
                      <div className="fw-medium">{card.card_holder_name}</div>
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
                    {card.card_type} Card
                  </h6>
                  <span className={`badge ${
                    card.status === 'ACTIVE' ? 'bg-success' :
                    card.status === 'BLOCKED' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {card.status}
                  </span>
                </div>

                {card.card_type === 'CREDIT' && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Available Credit</small>
                      <span className="fw-bold text-success">
                        {formatCurrency(card.available_credit)}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ 
                          width: `${(card.available_credit / card.credit_limit) * 100}%` 
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
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-gear"></i>
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-lock"></i>
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Actions */}
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
    </div>
  );
}

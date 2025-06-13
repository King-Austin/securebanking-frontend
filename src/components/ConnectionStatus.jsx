import { useState, useEffect } from 'react';
import api from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      await api.get('/health/', { timeout: 5000 });
      setStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Backend connection failed:', error);
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Backend Connected';
      case 'disconnected': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
      <div className={`alert alert-${getStatusColor()} d-flex align-items-center mb-0 py-2 px-3`} role="alert">
        <div className={`spinner-grow spinner-grow-sm me-2 ${status === 'checking' ? '' : 'd-none'}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <i className={`bi ${
          status === 'connected' ? 'bi-wifi' : 
          status === 'disconnected' ? 'bi-wifi-off' : 'bi-hourglass-split'
        } me-2`}></i>
        <small>
          {getStatusText()}
          {lastChecked && (
            <span className="ms-2 opacity-75">
              {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </small>
        <button 
          className="btn-close btn-close-white ms-3" 
          onClick={checkConnection}
          title="Refresh connection status"
        ></button>
      </div>
    </div>
  );
};

export default ConnectionStatus;

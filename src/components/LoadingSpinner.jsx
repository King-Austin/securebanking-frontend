const LoadingSpinner = ({ 
  size = 'lg', 
  text = 'Loading...', 
  variant = 'primary',
  fullScreen = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: '',
    xl: ''
  };

  const containerClass = fullScreen 
    ? 'd-flex justify-content-center align-items-center min-vh-100'
    : 'd-flex justify-content-center align-items-center p-3';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className={`spinner-border text-${variant} ${sizeClasses[size]}`} role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        {text && size !== 'sm' && (
          <div className="mt-2 text-muted small">{text}</div>
        )}
      </div>
    </div>
  );
};

// Error component for displaying errors
export const ErrorMessage = ({ 
  message, 
  onRetry = null, 
  variant = 'danger',
  dismissible = false,
  onDismiss = null 
}) => {
  return (
    <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} fade show`} role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div className="flex-grow-1">
          {message}
        </div>
        {onRetry && (
          <button 
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={onRetry}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        )}
        {dismissible && (
          <button 
            type="button" 
            className="btn-close" 
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;

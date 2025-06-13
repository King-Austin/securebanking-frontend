const LoadingSpinner = ({ size = 'lg' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: '',
    xl: ''
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

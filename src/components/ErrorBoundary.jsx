import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <div className="card card-banking p-5">
              <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
              <h2 className="mt-3 text-danger">Something went wrong</h2>
              <p className="text-muted mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-banking"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh Page
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                >
                  Try Again
                </button>
              </div>
              {this.props.showDetails && this.state.error && (
                <details className="mt-4 text-start">
                  <summary className="btn btn-sm btn-outline-secondary">Show Error Details</summary>
                  <pre className="mt-2 p-3 bg-light rounded small text-danger">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

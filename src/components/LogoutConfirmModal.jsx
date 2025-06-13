import { useState } from 'react';

const LogoutConfirmModal = ({ show, onConfirm, onCancel, user }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    await onConfirm();
    setIsLoggingOut(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div className="modal-backdrop fade show"></div>
      
      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title">Confirm Logout</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                disabled={isLoggingOut}
              ></button>
            </div>
            <div className="modal-body pt-2">
              <div className="text-center">
                <div className="mb-3">
                  <i className="bi bi-box-arrow-right text-warning fs-1"></i>
                </div>
                <p className="mb-2">
                  Are you sure you want to logout?
                </p>
                <small className="text-muted">
                  You will be redirected to the login page.
                </small>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirm}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Logging out...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirmModal;

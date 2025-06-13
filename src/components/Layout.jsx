import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ConnectionStatus from './ConnectionStatus';
import LogoutConfirmModal from './LogoutConfirmModal';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'bi-house' },
    { name: 'Accounts', href: '/accounts', icon: 'bi-credit-card' },
    { name: 'Transactions', href: '/transactions', icon: 'bi-arrow-left-right' },
    { name: 'Transfer', href: '/transfer', icon: 'bi-send' },
    { name: 'Beneficiaries', href: '/beneficiaries', icon: 'bi-people' },
    { name: 'Cards', href: '/cards', icon: 'bi-credit-card-2-front' },
    { name: 'Profile', href: '/profile', icon: 'bi-person' },
  ];

  const handleLogout = async () => {
    await logout(navigate);
    setShowLogoutModal(false);
  };

  const showLogoutConfirm = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-lg-none"
          style={{ zIndex: 1020 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar position-fixed top-0 start-0 h-100 bg-white shadow-lg d-flex flex-column ${
        sidebarOpen ? 'sidebar-open' : ''
      }`} style={{ width: '16rem', zIndex: 1030 }}>
        <div className="d-flex align-items-center justify-content-between p-3 banking-gradient">
          <h1 className="h5 fw-bold text-white mb-0">SecureCipher Bank</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-link text-white d-lg-none p-0"
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>
        
        <nav className="flex-grow-1 p-3">
          <div className="d-flex flex-column gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link-custom ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`${item.icon} me-3`}></i>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-top">
          <div className="d-flex align-items-center mb-3 text-white">
            <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-person-fill text-white"></i>
            </div>
            <div>
              <div className="fw-semibold small">{user?.first_name} {user?.last_name}</div>
              <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={showLogoutConfirm}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn btn-outline-secondary d-lg-none"
              >
                <i className="bi bi-list"></i>
              </button>
              
              {/* Page title or breadcrumb could go here */}
              <div className="d-none d-lg-block">
                
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small d-none d-md-block">
                  Welcome back, {user?.first_name || user?.username}!
                </span>
                
                {/* User dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-link p-0 d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                         style={{ width: '2rem', height: '2rem' }}>
                      <span className="text-white small fw-medium">
                        {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                    <i className="bi bi-chevron-down text-muted small"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={showLogoutConfirm}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Connection Status Indicator */}
      <ConnectionStatus />
      
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        show={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        user={user}
      />
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Set page title
  usePageTitle('Create Account');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '3rem', height: '3rem' }}>
                    <span className="text-white fs-4 fw-bold">SC</span>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Create your account</h2>
                  <p className="text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none fw-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Error Alert */}
                {errors.non_field_errors && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errors.non_field_errors[0]}</div>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="first_name" className="form-label fw-medium">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">{errors.first_name[0]}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="last_name" className="form-label fw-medium">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback">{errors.last_name[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-medium">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username[0]}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email[0]}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="mb-3">
                    <label htmlFor="phone_number" className="form-label fw-medium">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      required
                      className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                      placeholder="+234 800 000 0000"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                    {errors.phone_number && (
                      <div className="invalid-feedback">{errors.phone_number[0]}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 10 }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="password_confirm" className="form-label fw-medium">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        id="password_confirm"
                        name="password_confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                        placeholder="Confirm your password"
                        value={formData.password_confirm}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ zIndex: 10 }}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                      {errors.password_confirm && (
                        <div className="invalid-feedback">{errors.password_confirm[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary py-2"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary text-decoration-none">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

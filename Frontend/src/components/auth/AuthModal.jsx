import React, { useState } from 'react';
import './AuthModal.css';
import drdLogo from '../../assets/auth/drd-logo.png';
import communityImg from '../../assets/auth/community-illustration.png';
import healthWorkersImg from '../../assets/auth/health-workers-illustration.png';
import { X, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

const AuthModal = ({ isOpen, onClose, initialView = 'login', onLoginSuccess }) => {
  const [view, setView] = useState(initialView); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    workerId: '',
    phc: '',
    region: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (view === 'login') {
        result = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await authAPI.register({
          fullName: formData.fullName,
          phone: `${countryCode} ${formData.phone}`,
          email: formData.email,
          password: formData.password,
          workerId: formData.workerId,
          phc: formData.phc,
          region: formData.region
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(result?.user);
        }
      }, 800);
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div 
        className={`auth-modal-card ${view === 'signup' ? 'view-signup' : 'view-login'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="auth-close-btn" 
          onClick={onClose} 
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* LEFT BRANDING SIDEBAR */}
        <div className="auth-left-banner">
          <div className="banner-curve-accent" />

          {/* Logo Header */}
          <div className="auth-brand-header">
            <img src={drdLogo} alt="DRDtech AI Logo" className="auth-drd-logo" />
            <div className="auth-brand-text">
              <span className="drd-bold-dr">DR</span>
              <span className="drd-teal-dtech">Dtech</span>{' '}
              <span className="drd-bold-ai">AI</span>
            </div>
          </div>

          {/* Center Graphic Illustration */}
          <div className="auth-illustration-wrapper">
            {view === 'login' ? (
              <img 
                src={communityImg} 
                alt="Community Silhouette" 
                className="auth-hero-img img-community"
              />
            ) : (
              <img 
                src={healthWorkersImg} 
                alt="Healthcare Workers Team" 
                className="auth-hero-img img-workers"
              />
            )}
          </div>

          {/* Bottom Quote */}
          <div className="auth-quote-box">
            {view === 'login' ? (
              <p className="auth-quote">“Prevention is better than cure”</p>
            ) : (
              <p className="auth-quote">
                “As a healthcare worker, you hold the power to bring light into someone’s darkest day.”
              </p>
            )}
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="auth-right-content">
          {submitted ? (
            <div className="auth-success-state">
              <div className="success-badge">
                <Check size={32} />
              </div>
              <h3>{view === 'login' ? 'Logged In Successfully!' : 'Account Created Successfully!'}</h3>
              <p>Welcome to DRDtech AI & Medicall Health System.</p>
            </div>
          ) : view === 'login' ? (
            /* --- LOGIN FORM --- */
            <div className="auth-form-body">
              <div className="auth-header-area">
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-switch-text">
                  New to DRDtech AI?{' '}
                  <button 
                    type="button" 
                    className="auth-link-btn" 
                    onClick={() => { setView('signup'); setShowPassword(false); setError(''); }}
                  >
                    Sign up
                  </button>
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="login-username">Email Address</label>
                  <input
                    id="login-username"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your registered email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Your Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-primary-btn" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={18} className="analyzing-spin" /> Logging in...
                    </span>
                  ) : (
                    'Log in'
                  )}
                </button>

                <div className="auth-footer-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-custom" />
                    <span>Remember me</span>
                  </label>
                  {/*<a href="#forgot" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>*/}
                </div>
              </form>
            </div>
          ) : (
            /* --- SIGN UP FORM --- */
            <div className="auth-form-body">
              <div className="auth-header-area">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-switch-text">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="auth-link-btn" 
                    onClick={() => { setView('login'); setShowPassword(false); setError(''); }}
                  >
                    Log in
                  </button>
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form signup-grid">
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-phone">Phone Number</label>
                  <div className="phone-input-wrapper">
                    <div className="country-code-select">
                      <span className="flag-icon">🇮🇳</span>
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Code"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                      </select>
                    </div>
                    <input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@healthcenter.gov.in"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Your password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-worker-id">Worker ID / Government Badge Number</label>
                  <input
                    id="signup-worker-id"
                    name="workerId"
                    type="text"
                    required
                    value={formData.workerId}
                    onChange={handleInputChange}
                    placeholder="e.g. HW-KA-4921"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-phc">Assigned Primary Health Centre (PHC)</label>
                  <input
                    id="signup-phc"
                    name="phc"
                    type="text"
                    required
                    value={formData.phc}
                    onChange={handleInputChange}
                    placeholder="e.g. PHC Bangalore North"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-region">District / Region</label>
                  <input
                    id="signup-region"
                    name="region"
                    type="text"
                    required
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="e.g. Karnataka"
                  />
                </div>

                {/* Prominent Sign Up Action Button */}
                <button type="submit" className="auth-primary-btn signup-submit-btn" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={18} className="analyzing-spin" /> Creating Account...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>

                {/* Remember Me Checkbox */}
                <div className="auth-footer-row signup-footer-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-custom" />
                    <span>Remember me</span>
                  </label>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

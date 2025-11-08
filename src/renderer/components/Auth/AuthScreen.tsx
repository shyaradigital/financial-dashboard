import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Lock, Eye, EyeOff } from 'lucide-react';
import './AuthScreen.css';

interface AuthScreenProps {
  isSetup: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ isSetup }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthenticated, setLocked } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSetup) {
        // Setup new password
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const success = await window.electronAPI.setupMasterPassword(password);
        if (success) {
          setAuthenticated(true);
          setLocked(false);
        } else {
          setError('Failed to setup password');
        }
      } else {
        // Verify existing password
        const success = await window.electronAPI.verifyMasterPassword(password);
        if (success) {
          setAuthenticated(true);
          setLocked(false);
        } else {
          setError('Incorrect password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={48} />
          </div>
          <h1>Financial Dashboard</h1>
          <p>{isSetup ? 'Setup Master Password' : 'Enter Master Password'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="password">
              {isSetup ? 'Create Master Password' : 'Master Password'}
            </label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isSetup && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSetup ? 'Setup & Continue' : 'Unlock'}
          </button>

          {isSetup && (
            <div className="info-message">
              <p>⚠️ Remember this password! It cannot be recovered.</p>
              <p>All your financial data will be encrypted with this password.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;



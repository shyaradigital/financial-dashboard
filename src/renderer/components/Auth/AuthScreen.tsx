import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Lock, Eye, EyeOff, RotateCcw } from 'lucide-react';
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

  const handleReset = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your financial data and reset the application to a fresh state.\n\n' +
      'This action CANNOT be undone. Are you absolutely sure?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last chance. All data will be permanently deleted.\n\n' +
      'Click OK to confirm, or Cancel to abort.'
    );

    if (!doubleConfirm) return;

    try {
      setLoading(true);
      const success = await window.electronAPI.resetAllData();
      if (success) {
        alert('All data has been reset. The application will reload.');
        window.location.reload();
      } else {
        setError('Failed to reset data. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while resetting data.');
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

        {!isSetup && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="reset-button"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--danger)';
                  e.currentTarget.style.color = 'var(--danger)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <RotateCcw size={16} />
              Reset All Data
            </button>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              textAlign: 'center', 
              marginTop: '8px' 
            }}>
              Start fresh by deleting all data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;



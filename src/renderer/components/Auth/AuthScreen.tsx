import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Lock, Eye, EyeOff, RotateCcw } from 'lucide-react';
import ConfirmDialog from '../Common/ConfirmDialog';
import AlertDialog from '../Common/AlertDialog';
import { ensureAllInputsClickable, restoreInputFocus } from '../../utils/focusUtils';
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetDoubleConfirm, setShowResetDoubleConfirm] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const { setAuthenticated, setLocked } = useAppStore();

  // Ensure inputs are always focusable and clickable
  React.useEffect(() => {
    const ensureInputsClickable = () => {
      const inputs = document.querySelectorAll('.auth-form input');
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement;
        htmlInput.style.pointerEvents = 'auto';
        htmlInput.style.cursor = 'text';
        htmlInput.removeAttribute('readonly');
        if (htmlInput.disabled && !loading) {
          htmlInput.disabled = false;
        }
      });
    };

    // Run immediately and after a short delay
    ensureInputsClickable();
    const timer = setTimeout(ensureInputsClickable, 100);
    const timer2 = setTimeout(ensureInputsClickable, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [loading, isSetup]);

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

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    setTimeout(() => {
      setShowResetDoubleConfirm(true);
      ensureAllInputsClickable();
    }, 100);
  };

  const handleResetDoubleConfirm = async () => {
    setShowResetDoubleConfirm(false);
    
    try {
      setLoading(true);
      const success = await window.electronAPI.resetAllData();
      if (success) {
        setLoading(false);
        setShowResetAlert(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Failed to reset data. Please try again.');
        setLoading(false);
        ensureAllInputsClickable();
        restoreInputFocus('password');
      }
    } catch (err) {
      setError('An error occurred while resetting data.');
      setLoading(false);
      ensureAllInputsClickable();
      restoreInputFocus('password');
    }
  };

  const handleCloseResetDialogs = () => {
    setShowResetConfirm(false);
    setShowResetDoubleConfirm(false);
    setShowResetAlert(false);
    ensureAllInputsClickable();
    restoreInputFocus('password');
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

        <form onSubmit={handleSubmit} className="auth-form" onClick={(e) => e.stopPropagation()}>
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
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter password"
                required
                autoFocus
                disabled={loading}
                readOnly={false}
                autoComplete="current-password"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
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
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.stopPropagation()}
                placeholder="Confirm password"
                required
                disabled={loading}
                readOnly={false}
                autoComplete="new-password"
                style={{ pointerEvents: 'auto', cursor: 'text' }}
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
              onClick={handleResetClick}
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

        {/* Custom dialogs instead of window.confirm/alert */}
        <ConfirmDialog
          isOpen={showResetConfirm}
          onClose={handleCloseResetDialogs}
          onConfirm={handleResetConfirm}
          title="Reset All Data"
          message="⚠️ WARNING: This will permanently delete ALL your financial data and reset the application to a fresh state.\n\nThis action CANNOT be undone. Are you absolutely sure?"
          confirmText="Yes, Reset"
          cancelText="Cancel"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={showResetDoubleConfirm}
          onClose={handleCloseResetDialogs}
          onConfirm={handleResetDoubleConfirm}
          title="Final Confirmation"
          message="This is your last chance. All data will be permanently deleted.\n\nClick Confirm to proceed, or Cancel to abort."
          confirmText="Confirm Reset"
          cancelText="Cancel"
          variant="danger"
          loading={loading}
        />

        <AlertDialog
          isOpen={showResetAlert}
          onClose={() => {
            setShowResetAlert(false);
            window.location.reload();
          }}
          title="Reset Complete"
          message="All data has been reset. The application will reload."
          variant="success"
        />
      </div>
    </div>
  );
};

export default AuthScreen;



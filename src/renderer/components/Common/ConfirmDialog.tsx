import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantColors = {
    danger: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' }
  };

  const colors = variantColors[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ padding: '8px 0' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px'
        }}>
          <AlertTriangle size={24} color={colors.text} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ 
            color: 'var(--text-primary)', 
            fontSize: '14px', 
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-line'
          }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;


import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}) => {
  const variantConfig = {
    success: { 
      icon: CheckCircle, 
      bg: 'rgba(16, 185, 129, 0.1)', 
      border: '#10b981', 
      text: '#10b981' 
    },
    error: { 
      icon: XCircle, 
      bg: 'rgba(239, 68, 68, 0.1)', 
      border: '#ef4444', 
      text: '#ef4444' 
    },
    warning: { 
      icon: AlertTriangle, 
      bg: 'rgba(245, 158, 11, 0.1)', 
      border: '#f59e0b', 
      text: '#f59e0b' 
    },
    info: { 
      icon: Info, 
      bg: 'rgba(59, 130, 246, 0.1)', 
      border: '#3b82f6', 
      text: '#3b82f6' 
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ padding: '8px 0' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: '8px'
        }}>
          <Icon size={24} color={config.text} style={{ flexShrink: 0, marginTop: '2px' }} />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="button" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;


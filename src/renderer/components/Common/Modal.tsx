import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      // Ensure modal content is clickable
      setTimeout(() => {
        const modalContent = modalRef.current?.querySelector('.modal-content');
        if (modalContent) {
          (modalContent as HTMLElement).style.pointerEvents = 'auto';
        }
        
        // Focus first input in modal
        const firstInput = modalRef.current?.querySelector('input, textarea, select, button:not(.modal-close)') as HTMLElement;
        if (firstInput && firstInput.tagName !== 'BUTTON') {
          firstInput.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        setTimeout(() => {
          previousActiveElement.current?.focus();
          previousActiveElement.current = null;
        }, 100);
      }
      
      // Ensure all inputs are clickable after modal closes
      setTimeout(() => {
        const allInputs = document.querySelectorAll('input, textarea, select, button');
        allInputs.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.pointerEvents = 'auto';
          if (htmlEl.tagName === 'INPUT' || htmlEl.tagName === 'TEXTAREA') {
            (htmlEl as HTMLInputElement).style.cursor = 'text';
          }
        });
      }, 150);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="modal-overlay" 
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className={`modal-content modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;



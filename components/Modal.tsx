import React, { useEffect } from 'react';
import { X } from './Icons';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: ModalType;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCloseButton = true,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: '✅',
      border: 'border-green-500/50',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      button: 'bg-green-500 hover:bg-green-600',
    },
    error: {
      icon: '❌',
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      button: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: '⚠️',
      border: 'border-yellow-500/50',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      button: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      icon: 'ℹ️',
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-slate-800 rounded-2xl border ${style.border} ${style.bg} shadow-2xl transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{style.icon}</span>
            {title && (
              <h3 className={`text-lg font-semibold ${style.text}`}>
                {title}
              </h3>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-200 whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${style.button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;


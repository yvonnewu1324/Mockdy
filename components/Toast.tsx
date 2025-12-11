import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from './Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: ToastType;
  autoHideDuration?: number; // milliseconds, default 4000
}

const Toast: React.FC<ToastProps> = ({
  open,
  onClose,
  message,
  type = 'info',
  autoHideDuration = 4000,
}) => {
  // Auto-hide after duration
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      icon: <CheckCircle size={20} className="text-green-400" />,
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: <AlertCircle size={20} className="text-red-400" />,
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      icon: <AlertTriangle size={20} className="text-yellow-400" />,
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      icon: <Info size={20} className="text-blue-400" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="alert"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${style.border} ${style.bg} backdrop-blur-sm shadow-lg min-w-[300px] max-w-md`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">{style.icon}</div>

        {/* Message */}
        <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-700/50"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;


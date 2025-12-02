import React, { useEffect } from 'react';
import { ToastMessage, ToastType } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getStyles = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return 'bg-[#E8F5E9] border-r-4 border-[#2E7D32] text-[#2E7D32]';
      case ToastType.ERROR:
        return 'bg-[#FFEBEE] border-r-4 border-[#C62828] text-[#C62828]';
      case ToastType.WARNING:
        return 'bg-[#FFF3E0] border-r-4 border-[#E65100] text-[#E65100]';
      case ToastType.INFO:
      default:
        return 'bg-[#E3F2FD] border-r-4 border-[#1565C0] text-[#1565C0]';
    }
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded shadow-lg min-w-[300px] flex items-center justify-between animate-fade-in-down ${getStyles(toast.type)}`}>
      <span className="font-medium text-lg">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="mr-4 text-2xl font-bold opacity-50 hover:opacity-100">&times;</button>
    </div>
  );
};
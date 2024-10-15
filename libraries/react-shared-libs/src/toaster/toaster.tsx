'use client';

import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'warning';

export interface ToasterProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: FC<ToasterProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  }[type];

  const Icon = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XMarkIcon,
  }[type];

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg',
        'text-white transition-all duration-300 ease-in-out',
        bgColor
      )}
    >
      <Icon className="w-6 h-6 mr-3" />
      <p className="mr-8 font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export interface ToasterContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToasterContext = createContext<ToasterContextValue | undefined>(
  undefined
);

export const ToasterProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: ToastType }>
  >([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const handleClose = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed top-0 right-0 z-50">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => handleClose(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToasterContext.Provider>
  );
};

export const useToaster = (): ToasterContextValue => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

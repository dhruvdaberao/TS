import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

type ToastType = 'info' | 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Array<(toasts: ToastMessage[]) => void> = [];
let toasts: ToastMessage[] = [];

const toast = {
  info: (message: string) => {
    toastId += 1;
    toasts = [...toasts, { id: toastId, message, type: 'info' }];
    listeners.forEach(listener => listener(toasts));
  },
};

const Toast: React.FC<ToastMessage> = ({ message, type, id }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        listeners.forEach(listener => listener(toasts));
      }, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id]);

  const bgColor = type === 'info' ? 'bg-accent text-accent-text' : 
                  type === 'success' ? 'bg-green-500 text-white' : 
                  'bg-red-500 text-white';

  return (
    <div
      className={`w-full max-w-sm p-4 rounded-xl shadow-lg flex items-center space-x-3 transition-all duration-300 ease-in-out transform ${bgColor} ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex-shrink-0">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p className="font-semibold text-sm">{message}</p>
    </div>
  );
};

const Toaster: React.FC = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  const listener = useCallback((newToasts: ToastMessage[]) => {
    setCurrentToasts([...newToasts]);
  }, []);

  useEffect(() => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [listener]);

  const portalRoot = document.getElementById('root');
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {currentToasts.map(t => (
        <Toast key={t.id} {...t} />
      ))}
    </div>,
    portalRoot
  );
};

export { Toaster, toast };

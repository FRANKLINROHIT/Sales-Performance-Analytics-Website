import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
    </NotificationContext.Provider>
  );
};

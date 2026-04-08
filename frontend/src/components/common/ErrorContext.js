// ErrorContext.js
import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <ErrorContext.Provider value={{ error, showError }}>
      {children}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: '#ff4444',
          color: 'white',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {error}
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
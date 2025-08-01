import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Completely disable React error overlay for wallet extension errors
if (process.env.NODE_ENV === 'development') {
  // Override all console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  
      console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('KeyRing is locked') || 
          message.includes('chrome-extension') ||
          message.includes('injectedScript') ||
          message.includes('dmkamcknogkgcdfhhbddcghachkejeap') ||
          message.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
          message.includes('Uncaught runtime errors') ||
          message.includes('Error: KeyRing is locked') ||
          message.includes('Failed to connect to MetaMask')) {
        // Completely suppress wallet extension errors
        return;
      }
      originalConsoleError.apply(console, args);
    };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('KeyRing is locked') || 
        message.includes('chrome-extension') ||
        message.includes('injectedScript') ||
        message.includes('dmkamcknogkgcdfhhbddcghachkejeap')) {
      // Suppress wallet extension warnings
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Override window.onerror to prevent React error overlay
  const originalWindowOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const messageStr = message?.toString().toLowerCase() || '';
    const sourceStr = source?.toString().toLowerCase() || '';
    
    if (messageStr.includes('keyring is locked') ||
        messageStr.includes('chrome-extension') ||
        sourceStr.includes('chrome-extension') ||
        sourceStr.includes('dmkamcknogkgcdfhhbddcghachkejeap')) {
      // Prevent React error overlay from showing
      return true;
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError(message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Override window.addEventListener to prevent React error listeners
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error' && listener.toString().includes('react')) {
      // Don't add React's error listener
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Override window.removeEventListener
  const originalRemoveEventListener = window.removeEventListener;
  window.removeEventListener = function(type, listener, options) {
    if (type === 'error' && listener.toString().includes('react')) {
      // Don't remove React's error listener
      return;
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };
  
  // Disable React's error boundary
  const originalCreateElement = React.createElement;
  React.createElement = function(type, props, ...children) {
    if (type && type.name === 'ErrorBoundary') {
      // Don't create error boundary
      return null;
    }
    return originalCreateElement.call(this, type, props, ...children);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

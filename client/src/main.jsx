import React from 'react';
import ReactDOM from 'react-dom/client';
// Fixed path: directory is 'context', not 'contexts'
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { getValidToken } from './utils/tokenUtils';
import App from './App';
import './index.css';

// Clear any invalid tokens on app startup
getValidToken();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);



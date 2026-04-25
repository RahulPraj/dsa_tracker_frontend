import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background : '#161b22',
              color      : '#e6edf3',
              border     : '1px solid #30363d',
              borderRadius: '14px',
              fontSize   : '13px',
              fontFamily : '"DM Sans", sans-serif',
              padding    : '12px 16px',
            },
            success: { iconTheme: { primary: '#b5f23d', secondary: '#0d1117' } },
            error  : { iconTheme: { primary: '#f87171', secondary: '#0d1117' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

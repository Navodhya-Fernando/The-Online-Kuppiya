// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './assets/styles.css'; 
import { AuthProvider } from './contexts/AuthContext.jsx'; 
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';

try {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "https://6298f968728a2f48d410c6b7be0d7f69@o4510158676099072.ingest.de.sentry.io/4510158800420944",
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development'
  });
} catch (error) {
  console.warn('Failed to initialize Sentry:', error.message);
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        basename="/The-Online-Kuppiya"
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <SettingsProvider> 
          <AuthProvider> 
            <App />
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
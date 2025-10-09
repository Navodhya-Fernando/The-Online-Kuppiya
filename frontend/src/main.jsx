// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import App from './App.jsx';
import './assets/styles.css'; 
import { AuthProvider } from './contexts/AuthContext.jsx'; 
import { SettingsProvider } from './contexts/SettingsContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider> 
        <AuthProvider> 
          <App />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
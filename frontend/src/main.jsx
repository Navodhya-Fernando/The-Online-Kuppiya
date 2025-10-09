// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import BrowserRouter
import { BrowserRouter } from 'react-router-dom'; 
import App from './App.jsx';

// 2. Remove the old, non-existent CSS import
// import './index.css'; 

// 3. Import your actual global CSS file
import './assets/styles.css'; 

// 4. Import your existing AuthProvider
import { AuthProvider } from './contexts/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🚀 CRITICAL FIX: Wrap the entire application in BrowserRouter */}
    <BrowserRouter>
      {/* Wrap with your AuthProvider */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
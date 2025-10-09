// frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

// Import shared components
import Header from './components/shared/Header.jsx'; 
// import Footer from './components/shared/Footer.jsx'; // Optional

// Import ALL your page components based on your file structure:
// --- Auth Pages ---
import AuthLogin from './pages/Auth/Login.jsx'; 
import AuthRegister from './pages/Auth/Register.jsx'; 
// --- Resource Pages ---
import ResourceDetails from './pages/Resources/ResourceDetails.jsx';
import ResourceList from './pages/Resources/ResourceList.jsx';
import ResourceUpload from './pages/Resources/ResourceUpload.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import NotFound from './pages/NotFound.jsx'; 

// Import components used for protected routes (if needed in App.jsx)
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';


function App() {
  return (
    // Tailwind classes are active via CDN in index.html
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* Header outside Routes ensures it appears on all pages */}
      <Header /> 
      
      <main className="container mx-auto p-4">
        
        <Routes>
          {/* --- Home/Default Route --- */}
          {/* Your main page will likely be the ResourceList */}
          <Route path="/" element={<ResourceList />} />
          
          {/* --- Auth Routes --- */}
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthRegister />} />

          {/* --- Resource/Public Routes --- */}
          {/* We'll use the ResourceList as the home page and as a specific path */}
          <Route path="/resources" element={<ResourceList />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* --- Protected Routes (Example) --- */}
          <Route 
            path="/upload" 
            element={
              // Assuming ResourceUpload needs authentication
              <ProtectedRoute>
                <ResourceUpload />
              </ProtectedRoute>
            } 
          />
          
          {/* --- 404 Catch-All Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* <Footer /> */}
    </div>
  );
}

export default App;
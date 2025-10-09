import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { useSettings } from './contexts/SettingsContext';

import Header from './components/shared/Header.jsx'; 
import Footer from './components/shared/Footer.jsx'; 

import AuthLogin from './pages/Auth/Login.jsx'; 
import AuthRegister from './pages/Auth/Register.jsx'; 
import ForgotPasswordPage from './pages/Auth/ForgotPassword.jsx';
import ResetPasswordPage from './pages/Auth/ResetPassword.jsx';
import ResourceDetails from './pages/Resources/ResourceDetails.jsx';
import ResourceList from './pages/Resources/ResourceList.jsx'; 
import ResourceUpload from './pages/Resources/ResourceUpload.jsx';
import QuestionList from './pages/Forum/QuestionList.jsx';
import QuestionDetails from './pages/Forum/QuestionDetails.jsx';
import AskQuestion from './pages/Forum/AskQuestion.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import NotFound from './pages/NotFound.jsx'; 
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import ProfilePage from './pages/Profile.jsx';
import AdminUserApprovals from './components/admin/AdminUserApprovals.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';


function App() {
  const { isDarkMode } = useSettings();
  
  const backgroundClass = isDarkMode ? 'bg-background-page text-primary-text' : 'bg-light-bg text-light-text';
  
  return (
    <div className={`flex flex-col min-h-screen font-sans ${backgroundClass}`}>
      
      <Header /> 
      
      <main className="container mx-auto p-4 flex-grow">
        
        <Routes>
          <Route path="/" element={<ResourceList />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthRegister />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Public Routes */}
          <Route path="/resources" element={<ResourceList />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Q&A Forum Routes */}
          <Route path="/forum" element={<QuestionList />} />
          <Route path="/questions" element={<QuestionList />} />
          <Route path="/question/:id" element={<QuestionDetails />} />
          <Route 
            path="/ask" 
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected User Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/upload" element={<ProtectedRoute><ResourceUpload /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/user-approvals" 
            element={
              <ProtectedRoute>
                <AdminUserApprovals />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer /> 
    </div>
  );
}

export default App;
import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { useSettings } from './contexts/SettingsContext';

import Header from './components/shared/Header.jsx'; 
import Footer from './components/shared/Footer.jsx'; 

import AuthLogin from './pages/Auth/Login.jsx'; 
import AuthRegister from './pages/Auth/Register.jsx'; 
import ForgotPasswordPage from './pages/Auth/ForgotPassword.jsx';
import ResetPasswordPage from './pages/Auth/ResetPassword.jsx';
import Home from './pages/Home.jsx';

// Forum Pages
import QuestionList from './pages/Forum/QuestionList.jsx';
import QuestionDetails from './pages/Forum/QuestionDetails.jsx';
import AskQuestion from './pages/Forum/AskQuestion.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import NotFound from './pages/NotFound.jsx'; 
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import ProfilePage from './pages/Profile.jsx';
import EditProfile from './pages/Profile/EditProfile.jsx';
import AdminUserApprovals from './components/admin/AdminUserApprovals.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';


function App() {
  const { isDarkMode } = useSettings();
  
  return (
    <div className="app-container">
      
      <Header /> 
      
      <main className="main-content">
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthRegister />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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
          
          {/* Leaderboard Route */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Protected User Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } 
          />
          
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
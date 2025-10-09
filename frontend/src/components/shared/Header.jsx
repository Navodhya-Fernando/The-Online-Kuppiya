// frontend/src/components/shared/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo/Title */}
        <div className="text-2xl font-extrabold text-primary-blue">
          <Link to="/">The Online Kuppiya</Link>
        </div>
        
        {/* Navigation Links and Buttons */}
        <nav className="flex items-center space-x-6">
          <Link to="/resources" className="nav-link">Resources</Link>
          <Link to="/forum" className="nav-link font-semibold">Forum</Link> 
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/resources/upload" className="nav-link">Upload</Link>
              <span className="text-accent-yellow font-bold text-sm">{user?.username || 'User'}</span>
              <button onClick={logout} className="btn-secondary text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary text-sm">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
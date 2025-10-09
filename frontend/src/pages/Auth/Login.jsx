import React from 'react';
import Login from '../../components/auth/Login';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    // Added container and centering classes
    <div className="auth-page container flex justify-center items-center my-10"> 
      <Login />
    </div>
  );
};

export default LoginPage;
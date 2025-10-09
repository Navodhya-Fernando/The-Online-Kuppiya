import React from 'react';
import Register from '../../components/auth/Register';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    // Added container and centering classes
    <div className="auth-page container flex justify-center items-center my-10">
      <Register />
    </div>
  );
};

export default RegisterPage;
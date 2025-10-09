import React, { useEffect } from 'react';
import Login from '../../components/auth/Login';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
        navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);


  return (
    <div className="auth-page container flex justify-center items-center my-10"> 
      <Login />
    </div>
  );
};

export default LoginPage;
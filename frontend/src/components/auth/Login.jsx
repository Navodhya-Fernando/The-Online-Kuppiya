import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await login({ email, password });
      // Redirect handled by parent component (LoginPage)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container p-8 shadow-xl rounded-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-secondary text-sm">Sign in to your account</p>
      </div>
      
      {message && (
        <div className="bg-error text-red border-error p-4 rounded-lg mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span>❌</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-4" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-8 text-center space-y-4">
        <Link 
          to="/forgot-password" 
          className="block text-blue font-medium link-underline text-sm"
        >
          Forgot Password?
        </Link>
        <div className="text-secondary text-sm">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-blue font-medium link-underline"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
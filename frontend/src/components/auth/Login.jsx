import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam === 'registration-pending') {
      setMessage('✅ Registration successful! Your account is pending admin approval. You will be notified via email once approved.');
    }
  }, [searchParams]);

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
    <div 
      className="p-8 rounded-xl shadow-xl w-full max-w-md"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome Back
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Sign in to your account
        </p>
      </div>
      
      {message && (
        <div 
          className="p-4 rounded-lg mb-6 text-center border"
          style={{
            backgroundColor: message.includes('✅') || message.includes('successful') 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: message.includes('✅') || message.includes('successful')
              ? 'var(--accent-green)'
              : 'var(--accent-red)',
            borderColor: message.includes('✅') || message.includes('successful')
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(239, 68, 68, 0.2)'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{message.includes('✅') || message.includes('successful') ? '✅' : '❌'}</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="form-control w-full"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          required
        />
        <input
          className="form-control w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          required
        />
        <button 
          type="submit" 
          className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200"
          style={{
            backgroundColor: loading ? 'var(--bg-hover)' : 'var(--accent-blue)',
            color: 'var(--text-primary)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-8 text-center space-y-4">
        <Link 
          to="/forgot-password" 
          className="block font-medium text-sm transition-colors"
          style={{ 
            color: 'var(--accent-blue)',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue-hover)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--accent-blue)'}
        >
          Forgot Password?
        </Link>
        <div 
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-medium transition-colors"
            style={{ 
              color: 'var(--accent-blue)',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue-hover)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent-blue)'}
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
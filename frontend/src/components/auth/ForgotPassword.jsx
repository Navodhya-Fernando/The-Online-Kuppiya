import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await forgotPassword(identifier);
      setLinkSent(true);
      setMessage('Recovery link sent successfully to your email');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send recovery link');
    } finally {
      setLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="auth-form-container p-8 shadow-xl rounded-xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-green text-4xl">✓</div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-primary">Recovery Link Sent</h2>
          <p className="text-secondary mb-8">
            We've sent a password recovery link to your email. Please check your inbox and spam folder, then follow the instructions to reset your password.
          </p>
          <Link 
            to="/login" 
            className="btn btn-primary"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container p-8 shadow-xl rounded-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Reset Password</h2>
        <p className="text-secondary text-sm">We will send the reset link to your account email</p>
      </div>
      
      {message && (
        <div className={`text-center mb-6 p-4 rounded-lg ${
          message.includes('successfully') ? 'bg-success text-green border-success' : 'bg-error text-red border-error'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {message.includes('successfully') ? '✅' : '❌'}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control"
          type="email"
          placeholder="Enter your email address"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <button 
          type="submit" 
          className="btn btn-primary w-full mt-4" 
          disabled={loading || !identifier}
        >
          {loading ? 'Sending...' : 'Send Recovery Link'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <Link 
          to="/login" 
          className="block text-blue-600 hover:text-blue-800 text-sm"
        >
          Remember your password? Login
        </Link>
        <div className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setMessage('Password reset successful! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form-container p-8 bg-white shadow-xl rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4 text-primary">Password Reset Successful</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          <Link 
            to="/login" 
            className="btn btn-primary"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container p-8 bg-white shadow-xl rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Reset Your Password</h2>
      
      {message && (
        <div className={`text-center mb-4 p-3 rounded ${
          message.includes('successful') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control"
          type="password"
          placeholder="New Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />
        
        <input
          className="form-control mt-3"
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button 
          type="submit" 
          className="btn btn-primary w-full mt-4" 
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;

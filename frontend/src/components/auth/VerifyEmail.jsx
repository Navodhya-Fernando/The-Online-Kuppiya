import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { verifyEmail } from '../../api/authApi';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const runVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified. You can now log in once your account is approved.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    runVerification();
  }, [token]);

  return (
    <div className="auth-form-container p-8 shadow-xl rounded-xl max-w-md mx-auto mt-10">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: status === 'success' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(59, 130, 246, 0.16)' }}>
          <div className="text-4xl" style={{ color: status === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)' }}>
            {status === 'success' ? '✓' : status === 'error' ? '!' : '…'}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-primary">Verify Email</h2>
        <p className="text-secondary mb-8">{message}</p>
        <div className="flex flex-col gap-3">
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
          <Link to="/forgot-password" className="text-sm" style={{ color: 'var(--accent-blue)' }}>
            Need a password reset link?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers, approveUser, rejectUser } from '../../api/authApi';

const AdminUserApprovals = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await getPendingUsers();
      setPendingUsers(response.data.users || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await approveUser(userId);
      setMessage('User approved successfully');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await rejectUser(userId, rejectionReason);
      setMessage('User rejected successfully');
      setSelectedUser(null);
      setRejectionReason('');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const viewStudentId = (filePath) => {
    // Open the student ID file in a new window/tab
    const fileUrl = `/api/uploads/${filePath}`;
    window.open(fileUrl, '_blank');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="container">
        <div className="alert alert-error text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-modern">
          <div className="spinner" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading pending users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="modern-header mb-8">
        <div className="header-content">
          <h1 className="modern-title">User Registration Approvals</h1>
          <p className="modern-subtitle">Review and approve or reject pending user registrations</p>
        </div>
      </div>
      
      {message && (
        <div className={`mb-6 ${
          message.includes('success') ? 'alert alert-success' : 'alert alert-error'
        }`}>
          {message}
        </div>
      )}

      {!Array.isArray(pendingUsers) || pendingUsers.length === 0 ? (
        <div className="empty-modern">
          <div className="empty-icon">👥</div>
          <h3>No Pending Registrations</h3>
          <p>All user registrations have been processed.</p>
        </div>
      ) : (
        <div className="questions-modern">
          {pendingUsers.map((pendingUser) => (
            <div key={pendingUser._id} className="card p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Information */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-4 text-primary">
                    {pendingUser.name || `${pendingUser.firstName} ${pendingUser.lastName}`}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Email:</strong> <span className="text-secondary">{pendingUser.email}</span></div>
                    <div><strong>University:</strong> <span className="text-secondary">{pendingUser.university}</span></div>
                    <div><strong>Degree:</strong> <span className="text-secondary">{pendingUser.degree}</span></div>
                    <div><strong>Year:</strong> <span className="text-secondary">{pendingUser.year}</span></div>
                    <div><strong>Registered:</strong> <span className="text-secondary">{new Date(pendingUser.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {pendingUser.studentIdFile && (
                    <button
                      onClick={() => viewStudentId(pendingUser.studentIdFile)}
                      className="btn-minimal w-full"
                    >
                      📄 View Document
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleApproveUser(pendingUser._id)}
                    className="btn-minimal-primary w-full"
                    style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                  >
                    ✅ Approve
                  </button>
                  
                  <button
                    onClick={() => setSelectedUser(pendingUser)}
                    className="btn-minimal w-full"
                    style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)', color: 'white' }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="ask-question-card w-full max-w-md mx-4">
            <h3 className="page-title text-xl mb-4">
              Reject User: {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
            </h3>
            
            <div className="form-field mb-6">
              <label className="field-label">
                Rejection Reason:
              </label>
              <textarea
                className="field-textarea"
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            
            <div className="form-actions">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser._id)}
                className="btn-primary flex-1"
                style={{ background: 'var(--accent-red)' }}
                disabled={!rejectionReason.trim()}
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserApprovals;

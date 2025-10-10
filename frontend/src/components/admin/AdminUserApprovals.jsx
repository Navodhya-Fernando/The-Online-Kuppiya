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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading pending users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Registration Approvals</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {!Array.isArray(pendingUsers) || pendingUsers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No pending user registrations.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((pendingUser) => (
            <div key={pendingUser._id} className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    {pendingUser.firstName} {pendingUser.lastName}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {pendingUser.email}</div>
                    <div><strong>WhatsApp:</strong> {pendingUser.whatsappNumber}</div>
                    <div><strong>Institute:</strong> {pendingUser.institute}</div>
                    <div><strong>Student ID:</strong> {pendingUser.studentId}</div>
                    <div><strong>Degree Program:</strong> {pendingUser.degreeProgram}</div>
                    <div><strong>Academic Level:</strong> {pendingUser.level}</div>
                    <div><strong>Registered:</strong> {new Date(pendingUser.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => viewStudentId(pendingUser.studentIdFile)}
                    className="btn btn-secondary w-full"
                  >
                    📄 View Student ID Document
                  </button>
                  
                  <button
                    onClick={() => handleApproveUser(pendingUser._id)}
                    className="btn btn-success w-full"
                  >
                    ✅ Approve User
                  </button>
                  
                  <button
                    onClick={() => setSelectedUser(pendingUser)}
                    className="btn btn-danger w-full"
                  >
                    ❌ Reject User
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Reject User: {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason:
              </label>
              <textarea
                className="form-control"
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setRejectionReason('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser._id)}
                className="btn btn-danger flex-1"
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

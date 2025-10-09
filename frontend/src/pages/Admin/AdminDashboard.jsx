import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminUserApprovals from '../../components/admin/AdminUserApprovals';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access the admin dashboard.</p>
          <Link 
            to="/" 
            className="btn btn-primary mt-4 inline-block"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome, {user.firstName || user.username}! Manage user registrations and platform settings.
        </p>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center bg-info border-info">
            <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-blue text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">User Approvals</h3>
            <p className="text-secondary text-sm mb-4">Manage pending registrations</p>
            <Link 
              to="/admin/user-approvals" 
              className="btn btn-primary text-sm inline-block"
            >
              Manage Approvals
            </Link>
          </div>

          <div className="card p-6 text-center bg-success border-success">
            <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-green text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">User Management</h3>
            <p className="text-secondary text-sm mb-4">View and manage all users</p>
            <button 
              className="btn btn-secondary text-sm"
              disabled
            >
              Coming Soon
            </button>
          </div>

          <div className="card p-6 text-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-purple text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Analytics</h3>
            <p className="text-secondary text-sm mb-4">Platform statistics</p>
            <button 
              className="btn btn-secondary text-sm"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Recent Activity or Direct Access to User Approvals */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">Pending User Registrations</h2>
            <Link 
              to="/admin/user-approvals" 
              className="btn btn-primary text-sm"
            >
              View All Approvals
            </Link>
          </div>
          <p className="text-secondary mb-4">
            Quickly manage user registration approvals directly from this dashboard.
          </p>
        </div>
      </div>

      {/* Embed the User Approvals Component */}
      <AdminUserApprovals />
    </div>
  );
};

export default AdminDashboard;

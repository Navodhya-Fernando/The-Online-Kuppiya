import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    whatsappNumber: '',
    studentId: '',
    institute: '',
    degreeProgram: '',
    level: ''
  });
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Common institutes in Sri Lanka
  const institutes = [
    'NIBM - National Institute of Business Management',
    'University of Colombo',
    'University of Peradeniya',
    'University of Sri Jayewardenepura',
    'University of Kelaniya',
    'University of Moratuwa',
    'University of Ruhuna',
    'University of Jaffna',
    'Eastern University, Sri Lanka',
    'South Eastern University of Sri Lanka',
    'Rajarata University of Sri Lanka',
    'Sabaragamuwa University of Sri Lanka',
    'Wayamba University of Sri Lanka',
    'University of the Visual & Performing Arts',
    'Open University of Sri Lanka',
    'SLIIT - Sri Lanka Institute of Information Technology',
    'NSBM Green University',
    'APIIT Sri Lanka',
    'IIT - Informatics Institute of Technology'
  ];

  // Academic levels
  const levels = [
    '1st Year Undergraduate',
    '2nd Year Undergraduate', 
    '3rd Year Undergraduate',
    '4th Year Undergraduate',
    'Masters Student',
    'PhD Student',
    'Demonstrator',
    'Lecturer'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setStudentIdFile(file);
    } else if (file) {
      setError('Please upload a valid image file for Student ID verification');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'institute', 'degreeProgram', 'level'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate required file
    if (!studentIdFile) {
      setError('Please upload your Student ID document for verification');
      return;
    }

    try {
      // Map frontend form fields to backend expected fields
      const backendData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        university: formData.institute,
        degree: formData.degreeProgram,
        year: parseInt(formData.level.charAt(0)) || 1 // Extract year number from level
      };

      console.log('Sending registration data:', backendData);

      const result = await register(backendData);

      if (result.success) {
        if (result.requiresApproval) {
          setMessage('🎉 Registration successful! Your account is pending admin approval. You will receive an email notification once your account is approved and you can start using the platform.');
          // Don't redirect immediately for pending approval
          setTimeout(() => {
            window.location.href = '/login?message=registration-pending';
          }, 5000);
        } else {
          setMessage('Registration successful! Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container p-8 shadow-xl rounded-xl max-w-4xl mx-auto mt-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Create New Account</h2>
        <p className="text-secondary text-sm">Join The Online Kuppiya community</p>
      </div>

      {message && (
        <div className="text-center mb-6 p-4 rounded-lg bg-success text-green border-success">
          <div className="flex items-center justify-center gap-2">
            ✅
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center mb-6 p-4 rounded-lg bg-error text-red border-error">
          <div className="flex items-center justify-center gap-2">
            ❌
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input
              className="form-control"
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              className="form-control"
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              className="form-control"
              type="tel"
              name="whatsappNumber"
              placeholder="WhatsApp Number (with country code) *"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Password (min 6 characters) *"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
          />
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-700 border-b pb-2">Academic Information</div>
          
          <select
            className="form-control"
            name="institute"
            value={formData.institute}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Institute *</option>
            {institutes.map(institute => (
              <option key={institute} value={institute}>{institute}</option>
            ))}
          </select>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input
              className="form-control"
              type="text"
              name="studentId"
              placeholder="Student ID Number *"
              value={formData.studentId}
              onChange={handleInputChange}
              required
            />
            <input
              className="form-control"
              type="text"
              name="degreeProgram"
              placeholder="Degree Program *"
              value={formData.degreeProgram}
              onChange={handleInputChange}
              required
            />
          </div>

          <select
            className="form-control"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Academic Level *</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Student ID Document Upload - Required for Verification */}
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-700 border-b pb-2">Identity Verification</div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Student ID Document * (Required for verification)
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control flex-1"
                required
              />
              <button
                type="button"
                onClick={() => document.querySelector('input[type="file"]').click()}
                className="btn btn-secondary px-4 whitespace-nowrap"
              >
                📸 Take Photo
              </button>
            </div>
            {studentIdFile && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full text-xs">✓</span>
                Document uploaded: {studentIdFile.name}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Please upload a clear photo of your student ID card for verification purposes
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6" 
          disabled={loading}
        >
          {loading ? 'Submitting Registration...' : 'Submit Registration'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <div className="text-secondary text-sm">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue font-medium link-underline"
          >
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    whatsappNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    institute: '',
    studentId: '',
    degreeProgram: '',
    level: ''
  });
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setStudentIdFile(file);
    } else {
      setMessage('Please upload a valid image file for Student ID');
    }
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // This would typically open a camera interface
      // For now, we'll just trigger the file input
      document.getElementById('studentIdFile').click();
    } catch (error) {
      setMessage('Camera access denied. Please use file upload instead.');
    }
  };

  // Simplified registration - no OTP required

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!studentIdFile) {
      setMessage('Please upload your Student ID document for verification');
      setLoading(false);
      return;
    }

    // Check for required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'whatsappNumber', 'institute', 'studentId', 'degreeProgram', 'level'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setMessage(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🚀 Starting registration process...');
      const registrationData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          registrationData.append(key, formData[key]);
        }
      });
      registrationData.append('studentIdFile', studentIdFile);

      console.log('📝 Registration data prepared:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        hasFile: !!studentIdFile
      });

      console.log('📡 Calling register function...');
      await register(registrationData);
      setSuccess(true);
      setMessage('🎉 Registration submitted successfully! Your account is pending admin approval. Check back soon!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container p-8 shadow-xl rounded-xl max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Create New Account</h2>
        <p className="text-secondary text-sm">Join The Online Kuppiya community</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* WhatsApp Number */}
        <input
          className="form-control"
          type="tel"
          name="whatsappNumber"
          placeholder="WhatsApp Number (with country code) *"
          value={formData.whatsappNumber}
          onChange={handleInputChange}
          required
        />

        {/* Email */}
        <input
          className="form-control"
          type="email"
          name="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Password (min 6 chars) *"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
          />
          <input
            className="form-control"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Institute */}
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

        {/* Student ID File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Student ID Document *
          </label>
          <div className="flex gap-2">
            <input
              id="studentIdFile"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="form-control flex-1"
              required
            />
            <button
              type="button"
              onClick={capturePhoto}
              className="btn btn-secondary px-4"
            >
              📸 Take Photo
            </button>
          </div>
          {studentIdFile && (
            <div className="flex items-center gap-2 text-green text-sm font-medium">
              <span className="flex items-center justify-center w-5 h-5 bg-success rounded-full text-xs">✓</span>
              File uploaded: {studentIdFile.name}
            </div>
          )}
        </div>

        {/* Academic Information */}
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

        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6" 
          disabled={loading || success}
        >
          {loading ? 'Submitting Registration...' : success ? 'Registration Submitted ✓' : 'Submit Registration'}
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
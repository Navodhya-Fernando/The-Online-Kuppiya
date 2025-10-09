const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, university, degree, year } = req.body;

    // Validate required fields
    if (!name || !email || !password || !university || !degree || !year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      university,
      degree,
      year: parseInt(year),
      isApproved: true // Auto-approve for now
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response (don't include password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      degree: user.degree,
      year: user.year,
      credits: user.credits,
      reputation: user.reputation,
      role: user.role,
      isApproved: user.isApproved
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response (don't include password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      degree: user.degree,
      year: user.year,
      credits: user.credits,
      reputation: user.reputation,
      role: user.role,
      isApproved: user.isApproved
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get User Profile
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, university, degree, year } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (university) updateData.university = university;
    if (degree) updateData.degree = degree;
    if (year) updateData.year = parseInt(year);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  profile,
  updateProfile
};

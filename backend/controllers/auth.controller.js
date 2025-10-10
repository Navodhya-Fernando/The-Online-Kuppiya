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
      isApproved: false // Require admin approval
    });

    await user.save();

    // Send response (don't include password or token for unapproved users)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      degree: user.degree,
      year: user.year,
      role: user.role,
      isApproved: user.isApproved
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
      user: userResponse,
      requiresApproval: true
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
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will receive an email notification once approved.',
        isPending: true
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
    // Get user basic info
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Resource functionality removed - Q&A only platform

    // Get user's questions
    let questions = [];
    try {
      const Question = require('../models/Question.model');
      questions = await Question.find({ authorId: req.user.id })
        .select('title body courseCode tags createdAt answerCount upvotes downvotes status')
        .sort({ createdAt: -1 })
        .limit(10);
    } catch (error) {
      console.log('Question model error:', error.message);
      questions = [];
    }

    // Get user's answers
    let answers = [];
    try {
      const Answer = require('../models/Answer.model');
      answers = await Answer.find({ authorId: req.user.id })
        .select('content questionId createdAt upvotes downvotes')
        .populate('questionId', 'title courseCode')
        .sort({ createdAt: -1 })
        .limit(10);
    } catch (error) {
      console.log('Answer model error:', error.message);
      answers = [];
    }

    // Combine recent activity from Q&A only
    const recentActivity = [
      ...questions.map(item => ({ ...item.toObject(), type: 'question', timestamp: item.createdAt })),
      ...answers.map(item => ({ ...item.toObject(), type: 'answer', timestamp: item.createdAt }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Calculate stats (Q&A only)
    const questionCount = questions.length;
    const answerCount = answers.length;

    const userProfile = {
      ...user.toObject(),
      questions,
      answers,
      recentActivity,
      questionCount,
      answerCount
    };

    res.json({
      success: true,
      user: userProfile
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
    const { name, university, degree, year, avatar, bio } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (university) updateData.university = university;
    if (degree) updateData.degree = degree;
    if (year) updateData.year = parseInt(year);
    if (avatar) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;

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

// Get Pending Users (Admin Only)
const getPendingUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const pendingUsers = await User.find({ isApproved: false });
    res.json({ success: true, users: pendingUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending users', error: error.message });
  }
};

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  getPendingUsers
};

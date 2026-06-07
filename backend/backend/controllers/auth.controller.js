const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApprovalEmail,
} = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const getAppUrl = () => {
  const configuredUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || process.env.APP_URL || 'http://localhost:3003';
  return configuredUrl.split(',')[0].trim().replace(/\/$/, '');
};

const createSecureToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

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

    const verificationToken = createSecureToken();

    // Create new user
    const user = new User({
      name,
      email,
      password,
      university,
      degree,
      year: parseInt(year),
      isApproved: false,
      emailVerified: false,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await user.save();

    let verificationEmailSent = false;
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: `${getAppUrl()}/verify-email/${verificationToken}`,
      });
      verificationEmailSent = true;
    } catch (emailError) {
      console.error('Verification email error:', emailError.message);
    }

    // Send response (don't include password or token for unapproved users)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      degree: user.degree,
      year: user.year,
      role: user.role,
      isApproved: user.isApproved,
      emailVerified: user.emailVerified
    };

    res.status(201).json({
      success: true,
      message: verificationEmailSent
        ? 'Registration successful! Check your inbox to verify your email, then wait for admin approval.'
        : 'Registration successful! Your account is pending verification and admin approval.',
      user: userResponse,
      requiresApproval: true,
      requiresEmailVerification: true,
      verificationEmailSent
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

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        emailVerified: false,
        resendVerification: true
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
      isApproved: user.isApproved,
      emailVerified: user.emailVerified
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

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired'
      });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists, a verification email has been sent.'
      });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    const verificationToken = createSecureToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: `${getAppUrl()}/verify-email/${verificationToken}`,
      });
    } catch (emailError) {
      console.error('Resend verification email error:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'If an account exists, a verification email has been sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const targetEmail = (email || identifier || '').toLowerCase().trim();

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists, a password reset email has been sent.'
      });
    }

    const resetToken = createSecureToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${getAppUrl()}/reset-password/${resetToken}`,
      });
    } catch (emailError) {
      console.error('Password reset email error:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'If an account exists, a password reset email has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset email',
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired'
      });
    }

    user.password = password;
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
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


// Approve User (Admin Only)
const approveUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    try {
      await sendApprovalEmail({
        to: user.email,
        name: user.name,
        loginUrl: `${getAppUrl()}/login`,
      });
    } catch (emailError) {
      console.error('Approval email error:', emailError.message);
    }
    res.json({ success: true, message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve user', error: error.message });
  }
};

// Reject User (Admin Only)
const rejectUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User rejected and deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject user', error: error.message });
  }
};

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  getPendingUsers,
  approveUser,
  rejectUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
};

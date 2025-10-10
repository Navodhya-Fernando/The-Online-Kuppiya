const express = require('express');
const router = express.Router();
const { register, login, profile, updateProfile, getPendingUsers, approveUser, rejectUser } = require('../controllers/auth.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, profile);
router.put('/profile', authenticateToken, updateProfile);

// Admin routes for user approval/rejection (FIXED)
router.get('/pending-users', authenticateToken, requireAdmin, getPendingUsers);
router.put('/approve-user/:userId', authenticateToken, requireAdmin, approveUser);
router.put('/reject-user/:userId', authenticateToken, requireAdmin, rejectUser); 

module.exports = router;
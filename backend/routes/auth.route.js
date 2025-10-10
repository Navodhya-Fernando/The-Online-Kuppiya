const express = require('express');
const router = express.Router();
const { register, login, profile, updateProfile, getPendingUsers, approveUser, rejectUser } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, profile);
router.put('/profile', authenticateToken, updateProfile);

// Admin route to get pending users

// Admin routes for user approval/rejection
router.get('/pending-users', authenticateToken, getPendingUsers);
router.put('/approve/:id', authenticateToken, approveUser);
router.delete('/reject/:id', authenticateToken, rejectUser);

module.exports = router;

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

// Admin routes
router.get('/pending-users', authenticateToken, getPendingUsers);
router.put('/approve/:userId', authenticateToken, approveUser);
router.delete('/reject/:userId', authenticateToken, rejectUser);

module.exports = router;

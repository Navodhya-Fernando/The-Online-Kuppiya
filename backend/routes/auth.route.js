// navodhya-fernando/the-online-kuppiya/.../backend/routes/auth.route.js

const express = require('express');
const router = express.Router();
// FIX: Ensure all controller functions are imported
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
// FIX: Simplify route paths to match the console error/API client logic
router.put('/approve/:id', authenticateToken, requireAdmin, approveUser); // Use /approve/:id
router.delete('/reject/:id', authenticateToken, requireAdmin, rejectUser); // Use /reject/:id

module.exports = router;
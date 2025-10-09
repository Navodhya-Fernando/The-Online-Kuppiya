const express = require('express');
const router = express.Router();
const { register, login, profile, updateProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, profile);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;

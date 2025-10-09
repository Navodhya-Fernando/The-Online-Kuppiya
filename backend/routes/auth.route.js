const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); 
const { protect } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', authController.registerUser);

// POST /api/auth/login
router.post('/login', authController.loginUser);

// GET /api/auth/logout - Protected route to handle token invalidation (or clearing cookie)
router.get('/logout', protect, authController.logoutUser);

module.exports = router;
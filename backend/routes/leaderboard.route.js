const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserStats } = require('../controllers/leaderboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getLeaderboard);

// Protected routes
router.get('/user/:userId', authenticateToken, getUserStats);

module.exports = router;

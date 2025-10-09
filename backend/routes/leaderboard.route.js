const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

// Public routes
router.get('/', leaderboardController.getLeaderboard);
router.get('/stats', leaderboardController.getPlatformStats);

module.exports = router;

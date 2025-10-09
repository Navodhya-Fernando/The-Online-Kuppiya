const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); 
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

// Test route for debugging
router.post('/test-register', authController.testRegister);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

// OTP routes removed - using student ID verification instead

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Admin/Moderator routes (protected)
router.get('/pending-users', protect, authController.getPendingUsers);
router.put('/approve-user/:userId', protect, authController.approveUser);
router.put('/reject-user/:userId', protect, authController.rejectUser);

module.exports = router;
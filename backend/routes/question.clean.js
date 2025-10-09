const express = require('express');
const router = express.Router();
const { 
  createQuestion, 
  getAllQuestions, 
  getQuestionById, 
  voteQuestion, 
  deleteQuestion,
  createAnswer,
  voteAnswer,
  acceptAnswer,
  deleteAnswer
} = require('../controllers/question.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);

// Protected routes - Questions
router.post('/', authenticateToken, createQuestion);
router.post('/:id/vote', authenticateToken, voteQuestion);
router.delete('/:id', authenticateToken, deleteQuestion);

// Protected routes - Answers
router.post('/:id/answers', authenticateToken, createAnswer);
router.post('/answers/:answerId/vote', authenticateToken, voteAnswer);
router.post('/answers/:answerId/accept', authenticateToken, acceptAnswer);
router.delete('/answers/:answerId', authenticateToken, deleteAnswer);

module.exports = router;

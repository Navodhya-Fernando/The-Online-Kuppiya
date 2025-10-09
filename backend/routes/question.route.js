const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { protect } = require('../middleware/auth.middleware');

// @route GET /api/questions - List all questions
router.get('/', questionController.getQuestions);

// @route POST /api/questions - Post a new question (Protected)
router.post('/', protect, questionController.postQuestion);

// @route GET /api/questions/:id - Get a single question and its answers
router.get('/:id', questionController.getQuestionDetails);

// @route POST /api/questions/:id/answers - Post an answer to a question (Protected)
router.post('/:id/answers', protect, questionController.postAnswer);

// Future routes: Voting, Accepting Answer...

module.exports = router;
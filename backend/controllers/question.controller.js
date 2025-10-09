// backend/controllers/question.controller.js
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model'); 

// @desc    Get all questions
// @route   GET /api/questions
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('authorId', 'username') // Only need username for list view
            .sort({ createdAt: -1 }); 
        res.status(200).json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching questions.' });
    }
};

// @desc    Post a new question
// @route   POST /api/questions
exports.postQuestion = async (req, res) => {
    const { title, body, courseCode, tags } = req.body;

    if (!title || !body) {
        return res.status(400).json({ message: 'Please include a title and body.' });
    }

    try {
        const newQuestion = await Question.create({
            title,
            body,
            courseCode: courseCode || 'GENERAL',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            authorId: req.user._id, // Set by the protect middleware
        });

        // Reward the user for asking a question (Gamification Phase 3)
        await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 10, uploadCount: 1 } }); 

        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to post question.', error: error.message });
    }
};

// @desc    Get a single question and its answers
// @route   GET /api/questions/:id
exports.getQuestionDetails = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('authorId', 'username email credits')
            .lean(); // Use lean() for better performance

        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        const answers = await Answer.find({ questionId: req.params.id })
            .populate('authorId', 'username email credits')
            .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })
            .lean(); 

        res.status(200).json({ question, answers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching question details.' });
    }
};

// @desc    Post an answer to a question
// @route   POST /api/questions/:id/answers
exports.postAnswer = async (req, res) => {
    const { body } = req.body;
    const questionId = req.params.id;

    if (!body) {
        return res.status(400).json({ message: 'Answer body cannot be empty.' });
    }

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        const newAnswer = await Answer.create({
            questionId,
            body,
            authorId: req.user._id,
        });

        // Update the question's answer count
        question.answerCount += 1;
        await question.save();

        // Reward the user for answering (Gamification Phase 3)
        await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 5 } }); 

        // Return the full answer with populated author for immediate display
        const populatedAnswer = await newAnswer.populate('authorId', 'username');
        
        res.status(201).json(populatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to post answer.', error: error.message });
    }
};
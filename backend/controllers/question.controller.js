const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model');

// Create Question
const createQuestion = async (req, res) => {
  try {
    const { title, body, courseCode, tags } = req.body;

    if (!title || !body || !courseCode) {
      return res.status(400).json({
        success: false,
        message: 'Title, body, and courseCode are required'
      });
    }

    const userId = req.user._id || req.user.id;

    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
      }
    }

    const question = new Question({
      title: title.trim(),
      body: body.trim(),
      courseCode: courseCode.trim(),
      authorId: userId,
      tags: processedTags
    });

    await question.save();
    await User.findByIdAndUpdate(userId, { $inc: { credits: 5, reputation: 2 } });
    await question.populate('authorId', 'name university degree');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
};

// Get All Questions
const getAllQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      course, 
      university, 
      tags,
      search,
      sortBy = 'newest',
      status
    } = req.query;

    const filter = {};
    
    if (course) filter.course = new RegExp(course, 'i');
    if (university) filter.university = new RegExp(university, 'i');
    if (status && status !== 'all') filter.status = status;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    let sortOption = {};
    switch (sortBy) {
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'views': sortOption = { viewCount: -1 }; break;
      case 'answers': sortOption = { answerCount: -1 }; break;
      case 'newest':
      default: sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(filter)
      .populate('authorId', 'name university degree reputation')
      .populate('acceptedAnswerId')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    if (sortBy === 'votes') {
      questions.sort((a, b) => b.voteScore - a.voteScore);
    }

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuestions: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
};

// Get Question by ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('authorId', 'name university degree reputation');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.viewCount += 1;
    await question.save();

    const answers = await Answer.find({ questionId: question._id })
      .populate('authorId', 'name university degree reputation role')
      .sort({ verifiedByInstructor: -1, isAccepted: -1, createdAt: -1 });

    res.json({
      success: true,
      question,
      answers
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
};

// Vote on Question
const voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (voteType === 'up') await question.upvote(req.user.id);
    else if (voteType === 'down') await question.downvote(req.user.id);
    else return res.status(400).json({ success: false, message: 'Invalid vote type. Use "up" or "down"' });

    await User.findByIdAndUpdate(question.authorId, {
      $inc: { reputation: voteType === 'up' ? 1 : -1 }
    });

    res.json({
      success: true,
      message: `Question ${voteType}voted successfully`,
      voteScore: question.voteScore,
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ success: false, message: 'Failed to vote', error: error.message });
  }
};

// Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (question.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
    }

    await Answer.deleteMany({ questionId: question._id });
    await Question.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
};

// Create Answer
const createAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const questionId = req.params.id;

    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const userId = req.user._id || req.user.id;

    const answer = new Answer({
      content: content.trim(),
      questionId,
      authorId: userId
    });

    await answer.save();

    question.answerCount += 1;
    await question.save();

    await User.findByIdAndUpdate(userId, { $inc: { credits: 3, reputation: 1 } });
    await answer.populate('authorId', 'name university degree reputation role');

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create answer', error: error.message });
  }
};

// Vote on Answer
const voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    if (voteType === 'up') await answer.upvote(req.user.id);
    else if (voteType === 'down') await answer.downvote(req.user.id);
    else return res.status(400).json({ success: false, message: 'Invalid vote type. Use "up" or "down"' });

    await User.findByIdAndUpdate(answer.authorId, {
      $inc: { reputation: voteType === 'up' ? 1 : -1 }
    });

    res.json({
      success: true,
      message: `Answer ${voteType}voted successfully`,
      voteScore: answer.voteScore,
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to vote', error: error.message });
  }
};

// Accept Answer (By Student Author)
const acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    const question = await Question.findById(answer.questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (question.authorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only question author can accept answers' });
    }

    if (question.acceptedAnswerId) {
      await Answer.findByIdAndUpdate(question.acceptedAnswerId, { 
        isAccepted: false,
        $unset: { acceptedAt: 1 }
      });
    }

    await answer.markAsAccepted();

    question.acceptedAnswerId = answer._id;
    question.status = 'answered';
    await question.save();

    await User.findByIdAndUpdate(answer.authorId, { $inc: { credits: 15, reputation: 10 } });

    res.json({ success: true, message: 'Answer accepted successfully', answer });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept answer', error: error.message });
  }
};

// Delete Answer
const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    if (answer.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this answer' });
    }

    const question = await Question.findById(answer.questionId);
    if (question) {
      question.answerCount = Math.max(0, question.answerCount - 1);
      if (question.acceptedAnswerId && question.acceptedAnswerId.toString() === answer._id.toString()) {
        question.acceptedAnswerId = null;
        question.status = question.answerCount > 0 ? 'open' : 'open';
      }
      await question.save();
    }

    await Answer.findByIdAndDelete(req.params.answerId);
    res.json({ success: true, message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete answer', error: error.message });
  }
};

// --- NEW: Verify Answer (TA / Instructor Only) ---
const verifyAnswer = async (req, res, next) => {
  try {
      const { questionId, answerId } = req.params;

      // Ensure the user is an instructor or admin
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Only instructors can verify answers.' });
      }

      const answer = await Answer.findById(answerId);
      if (!answer) {
          return res.status(404).json({ success: false, message: 'Answer not found' });
      }

      // Ensure the answer belongs to the correct question
      if (answer.questionId.toString() !== questionId) {
          return res.status(400).json({ success: false, message: 'Answer does not belong to this question' });
      }

      // Toggle the verification status
      answer.verifiedByInstructor = !answer.verifiedByInstructor;
      await answer.save();

      // Bonus: Reward the user whose answer was verified by a TA
      if (answer.verifiedByInstructor) {
         await User.findByIdAndUpdate(answer.authorId, { $inc: { reputation: 15, credits: 20 } });
      }

      res.status(200).json({
          success: true,
          message: answer.verifiedByInstructor ? 'Answer verified successfully' : 'Verification removed',
          verifiedByInstructor: answer.verifiedByInstructor
      });
  } catch (error) {
      console.error('Verify answer error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify answer', error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  voteQuestion,
  deleteQuestion,
  createAnswer,
  voteAnswer,
  acceptAnswer,
  deleteAnswer,
  verifyAnswer // <-- Exported here
};
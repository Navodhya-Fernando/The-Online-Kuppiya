const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model');

// Create Question
const createQuestion = async (req, res) => {
  try {
    const { title, body, courseCode, tags } = req.body;

    // Validate required fields
    if (!title || !body || !courseCode) {
      return res.status(400).json({
        success: false,
        message: 'Title, body, and courseCode are required'
      });
    }

    // Use _id instead of id for consistency
    const userId = req.user._id || req.user.id;

    // Process tags - handle both array and string inputs
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
      }
    }

    // Create question
    const question = new Question({
      title: title.trim(),
      body: body.trim(),
      courseCode: courseCode.trim(),
      authorId: userId,
      tags: processedTags
    });

    await question.save();

    // Award credits to question author
    await User.findByIdAndUpdate(userId, { $inc: { credits: 5, reputation: 2 } });

    // Populate author info
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
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'views':
        sortOption = { viewCount: -1 };
        break;
      case 'answers':
        sortOption = { answerCount: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(filter)
      .populate('authorId', 'name university degree reputation')
      .populate('acceptedAnswerId')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Sort by vote score if requested
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
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment view count
    question.viewCount += 1;
    await question.save();

    // Get answers for this question  
    const answers = await Answer.find({ questionId: question._id })
      .populate('authorId', 'name university degree reputation')
      .sort({ isAccepted: -1, createdAt: -1 });

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
    const { voteType } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (voteType === 'up') {
      await question.upvote(req.user.id);
    } else if (voteType === 'down') {
      await question.downvote(req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "up" or "down"'
      });
    }

    // Update author reputation
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
    res.status(500).json({
      success: false,
      message: 'Failed to vote',
      error: error.message
    });
  }
};

// Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns the question or is admin
    if (question.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    // Delete all answers for this question
    await Answer.deleteMany({ questionId: question._id });

    // Delete the question
    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message
    });
  }
};

// Create Answer
const createAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const questionId = req.params.id;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Use consistent user ID reference
    const userId = req.user._id || req.user.id;

    // Create answer
    const answer = new Answer({
      content: content.trim(),
      questionId,
      authorId: userId
    });

    await answer.save();

    // Update question answer count
    question.answerCount += 1;
    await question.save();

    // Award credits to answer author
    await User.findByIdAndUpdate(userId, { $inc: { credits: 3, reputation: 1 } });

    // Populate author info
    await answer.populate('authorId', 'name university degree reputation');

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create answer',
      error: error.message
    });
  }
};

// Vote on Answer
const voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    if (voteType === 'up') {
      await answer.upvote(req.user.id);
    } else if (voteType === 'down') {
      await answer.downvote(req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "up" or "down"'
      });
    }

    // Update author reputation
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
    res.status(500).json({
      success: false,
      message: 'Failed to vote',
      error: error.message
    });
  }
};

// Accept Answer
const acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const question = await Question.findById(answer.questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns the question
    if (question.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only question author can accept answers'
      });
    }

    // Unmark previous accepted answer if exists
    if (question.acceptedAnswerId) {
      await Answer.findByIdAndUpdate(question.acceptedAnswerId, { 
        isAccepted: false,
        $unset: { acceptedAt: 1 }
      });
    }

    // Mark this answer as accepted
    await answer.markAsAccepted();

    // Update question
    question.acceptedAnswerId = answer._id;
    question.status = 'answered';
    await question.save();

    // Award bonus credits to answer author
    await User.findByIdAndUpdate(answer.authorId, { 
      $inc: { credits: 15, reputation: 10 }
    });

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      answer
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept answer',
      error: error.message
    });
  }
};

// Delete Answer
const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user owns the answer or is admin
    if (answer.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer'
      });
    }

    const question = await Question.findById(answer.questionId);
    
    if (question) {
      // Update question answer count
      question.answerCount = Math.max(0, question.answerCount - 1);
      
      // If this was the accepted answer, update question status
      if (question.acceptedAnswerId && question.acceptedAnswerId.toString() === answer._id.toString()) {
        question.acceptedAnswerId = null;
        question.status = question.answerCount > 0 ? 'open' : 'open';
      }
      
      await question.save();
    }

    await Answer.findByIdAndDelete(req.params.answerId);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete answer',
      error: error.message
    });
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
  deleteAnswer
};

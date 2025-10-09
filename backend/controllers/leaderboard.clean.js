const User = require('../models/User.model');
const Resource = require('../models/Resource.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');

// Get Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { 
      type = 'reputation', // 'reputation', 'credits', 'uploads', 'questions', 'answers'
      limit = 20,
      university,
      timeframe = 'all' // 'all', 'week', 'month'
    } = req.query;

    let sortField = {};
    switch (type) {
      case 'credits':
        sortField = { credits: -1 };
        break;
      case 'uploads':
        sortField = { uploadCount: -1 };
        break;
      case 'reputation':
      default:
        sortField = { reputation: -1 };
    }

    const filter = { isApproved: true };
    if (university) {
      filter.university = new RegExp(university, 'i');
    }

    // Get top users
    const topUsers = await User.find(filter)
      .select('name university degree credits reputation role joinedAt')
      .sort(sortField)
      .limit(parseInt(limit));

    // Get additional stats for each user
    const leaderboardData = await Promise.all(
      topUsers.map(async (user, index) => {
        const [resourceCount, questionCount, answerCount] = await Promise.all([
          Resource.countDocuments({ uploaderId: user._id, status: 'approved' }),
          Question.countDocuments({ authorId: user._id }),
          Answer.countDocuments({ authorId: user._id })
        ]);

        return {
          rank: index + 1,
          user: {
            id: user._id,
            name: user.name,
            university: user.university,
            degree: user.degree,
            role: user.role,
            joinedAt: user.joinedAt
          },
          stats: {
            reputation: user.reputation,
            credits: user.credits,
            resourcesUploaded: resourceCount,
            questionsAsked: questionCount,
            answersGiven: answerCount
          }
        };
      })
    );

    // Get platform statistics
    const [totalUsers, totalResources, totalQuestions, totalAnswers] = await Promise.all([
      User.countDocuments({ isApproved: true }),
      Resource.countDocuments({ status: 'approved' }),
      Question.countDocuments(),
      Answer.countDocuments()
    ]);

    res.json({
      success: true,
      leaderboard: leaderboardData,
      platformStats: {
        totalUsers,
        totalResources,
        totalQuestions,
        totalAnswers
      },
      filters: {
        type,
        university: university || 'All',
        timeframe,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// Get User Stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists and is approved
    const user = await User.findOne({ _id: userId, isApproved: true })
      .select('name university degree credits reputation role joinedAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's content statistics
    const [
      resourceCount,
      questionCount,
      answerCount,
      acceptedAnswerCount,
      totalResourceVotes,
      totalQuestionVotes,
      totalAnswerVotes
    ] = await Promise.all([
      Resource.countDocuments({ uploaderId: userId, status: 'approved' }),
      Question.countDocuments({ authorId: userId }),
      Answer.countDocuments({ authorId: userId }),
      Answer.countDocuments({ authorId: userId, isAccepted: true }),
      
      // Calculate total votes received on resources
      Resource.aggregate([
        { $match: { uploaderId: user._id } },
        { 
          $project: { 
            voteCount: { 
              $subtract: [
                { $size: "$upvotes" }, 
                { $size: "$downvotes" }
              ] 
            } 
          } 
        },
        { $group: { _id: null, totalVotes: { $sum: "$voteCount" } } }
      ]).then(result => result.length > 0 ? result[0].totalVotes : 0),
      
      // Calculate total votes received on questions
      Question.aggregate([
        { $match: { authorId: user._id } },
        { 
          $project: { 
            voteCount: { 
              $subtract: [
                { $size: "$upvotes" }, 
                { $size: "$downvotes" }
              ] 
            } 
          } 
        },
        { $group: { _id: null, totalVotes: { $sum: "$voteCount" } } }
      ]).then(result => result.length > 0 ? result[0].totalVotes : 0),
      
      // Calculate total votes received on answers
      Answer.aggregate([
        { $match: { authorId: user._id } },
        { 
          $project: { 
            voteCount: { 
              $subtract: [
                { $size: "$upvotes" }, 
                { $size: "$downvotes" }
              ] 
            } 
          } 
        },
        { $group: { _id: null, totalVotes: { $sum: "$voteCount" } } }
      ]).then(result => result.length > 0 ? result[0].totalVotes : 0)
    ]);

    // Get user's rank based on reputation
    const higherReputationCount = await User.countDocuments({
      reputation: { $gt: user.reputation },
      isApproved: true
    });
    const userRank = higherReputationCount + 1;

    // Get recent activity (last 10 resources and questions)
    const [recentResources, recentQuestions] = await Promise.all([
      Resource.find({ uploaderId: userId, status: 'approved' })
        .select('title course createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Question.find({ authorId: userId })
        .select('title course createdAt status')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        university: user.university,
        degree: user.degree,
        role: user.role,
        joinedAt: user.joinedAt
      },
      stats: {
        reputation: user.reputation,
        credits: user.credits,
        rank: userRank,
        resourcesUploaded: resourceCount,
        questionsAsked: questionCount,
        answersGiven: answerCount,
        acceptedAnswers: acceptedAnswerCount,
        totalVotesReceived: totalResourceVotes + totalQuestionVotes + totalAnswerVotes,
        acceptanceRate: questionCount > 0 ? Math.round((acceptedAnswerCount / answerCount) * 100) : 0
      },
      recentActivity: {
        resources: recentResources,
        questions: recentQuestions
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
};

module.exports = {
  getLeaderboard,
  getUserStats
};

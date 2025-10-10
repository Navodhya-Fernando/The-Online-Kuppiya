const User = require('../models/User.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');

// Get Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { 
      type = 'reputation', // 'reputation', 'questions', 'answers'
      limit = 10,
      page = 1
    } = req.query;

    let sortField = {};
    switch (type) {
      case 'questions':
        sortField = { questionsCount: -1 };
        break;
      case 'answers':
        sortField = { answersCount: -1 };
        break;
      case 'reputation':
      default:
        sortField = { reputation: -1 };
        break;
    }

    // Get top users with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const topUsers = await User.find({ isApproved: true })
      .sort(sortField)
      .limit(parseInt(limit))
      .skip(skip)
      .select('name university degree reputation role joinedAt avatar');

    // Get detailed stats for each user
    const leaderboardData = await Promise.all(
      topUsers.map(async (user, index) => {
        const [questionCount, answerCount] = await Promise.all([
          Question.countDocuments({ authorId: user._id }),
          Answer.countDocuments({ authorId: user._id })
        ]);

        return {
          rank: skip + index + 1,
          user: {
            id: user._id,
            name: user.name,
            university: user.university,
            degree: user.degree,
            role: user.role,
            joinedAt: user.joinedAt,
            avatar: user.avatar
          },
          stats: {
            reputation: user.reputation,
            questionsAsked: questionCount,
            answersGiven: answerCount
          }
        };
      })
    );

    // Get platform statistics
    const [totalUsers, totalQuestions, totalAnswers] = await Promise.all([
      User.countDocuments({ isApproved: true }),
      Question.countDocuments(),
      Answer.countDocuments()
    ]);

    res.json({
      success: true,
      leaderboard: leaderboardData,
      platformStats: {
        totalUsers,
        totalQuestions,
        totalAnswers
      },
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalUsers
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// Get user-specific leaderboard stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Get user details
    const user = await User.findById(userId)
      .select('name university degree reputation role joinedAt avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's activity counts
    const [questionCount, answerCount] = await Promise.all([
      Question.countDocuments({ authorId: userId }),
      Answer.countDocuments({ authorId: userId })
    ]);

    // Calculate total votes received on questions and answers
    const [totalQuestionVotes, totalAnswerVotes] = await Promise.all([
      // Calculate total votes received on questions
      Question.aggregate([
        { $match: { authorId: user._id } },
        { $group: { _id: null, totalVotes: { $sum: { $add: ['$upvotes', '$downvotes'] } } } }
      ]),
      // Calculate total votes received on answers
      Answer.aggregate([
        { $match: { authorId: user._id } },
        { $group: { _id: null, totalVotes: { $sum: { $add: ['$upvotes', '$downvotes'] } } } }
      ])
    ]);

    const totalVotesOnQuestions = totalQuestionVotes[0]?.totalVotes || 0;
    const totalVotesOnAnswers = totalAnswerVotes[0]?.totalVotes || 0;

    // Get user's ranking
    const userRank = await User.countDocuments({
      isApproved: true,
      reputation: { $gt: user.reputation }
    }) + 1;

    // Get recent activity (last 10 questions)
    const recentQuestions = await Question.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title content createdAt upvotes downvotes')
      .populate('tags', 'name');

    res.json({
      success: true,
      userStats: {
        user: {
          id: user._id,
          name: user.name,
          university: user.university,
          degree: user.degree,
          role: user.role,
          reputation: user.reputation,
          joinedAt: user.joinedAt,
          avatar: user.avatar
        },
        stats: {
          reputation: user.reputation,
          questionsAsked: questionCount,
          answersGiven: answerCount,
          totalVotesReceived: totalVotesOnQuestions + totalVotesOnAnswers,
          rank: userRank
        },
        recentActivity: {
          questions: recentQuestions
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getLeaderboard,
  getUserStats
};

// backend/controllers/leaderboard.controller.js
const User = require('../models/User.model');
const Resource = require('../models/Resource.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');

// @desc    Get top contributors leaderboard
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { type = 'overall', limit = 10 } = req.query;

        let leaderboard = [];

        switch (type) {
            case 'uploads':
                leaderboard = await User.find({ uploadCount: { $gt: 0 } })
                    .select('firstName lastName uploadCount credits')
                    .sort({ uploadCount: -1 })
                    .limit(parseInt(limit));
                break;

            case 'credits':
                leaderboard = await User.find({ credits: { $gt: 0 } })
                    .select('firstName lastName uploadCount credits')
                    .sort({ credits: -1 })
                    .limit(parseInt(limit));
                break;

            case 'questions':
                // Get users with most questions asked
                const questionStats = await Question.aggregate([
                    { $group: { _id: '$authorId', questionCount: { $sum: 1 } } },
                    { $sort: { questionCount: -1 } },
                    { $limit: parseInt(limit) }
                ]);

                const userIds = questionStats.map(stat => stat._id);
                const users = await User.find({ _id: { $in: userIds } })
                    .select('firstName lastName uploadCount credits');

                leaderboard = questionStats.map(stat => {
                    const user = users.find(u => u._id.toString() === stat._id.toString());
                    return {
                        ...user.toObject(),
                        questionCount: stat.questionCount
                    };
                });
                break;

            case 'overall':
            default:
                // Overall ranking based on weighted score
                leaderboard = await User.find({ 
                    $or: [
                        { uploadCount: { $gt: 0 } },
                        { credits: { $gt: 0 } }
                    ]
                })
                .select('firstName lastName uploadCount credits')
                .sort({ credits: -1, uploadCount: -1 })
                .limit(parseInt(limit));
                break;
        }

        // Add ranking numbers and avatars
        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            username: `${user.firstName}_${user.lastName.charAt(0)}`,
            firstName: user.firstName,
            lastName: user.lastName,
            uploads: user.uploadCount || 0,
            credits: user.credits || 0,
            questionCount: user.questionCount || 0,
            avatar: `${user.firstName?.charAt(0) || 'U'}${user.lastName?.charAt(0) || 'U'}`
        }));

        res.status(200).json({
            type,
            leaderboard: rankedLeaderboard,
            total: rankedLeaderboard.length
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard data.' });
    }
};

// @desc    Get platform statistics
// @route   GET /api/leaderboard/stats
exports.getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalResources,
            totalQuestions,
            totalDownloads,
            topUploaders,
            recentActivity
        ] = await Promise.all([
            User.countDocuments({ approvalStatus: 'approved' }),
            Resource.countDocuments({ status: 'approved' }),
            Question.countDocuments(),
            Resource.aggregate([
                { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
            ]),
            User.find({ uploadCount: { $gt: 0 } })
                .select('firstName lastName uploadCount')
                .sort({ uploadCount: -1 })
                .limit(3),
            Resource.find({ status: 'approved' })
                .populate('uploaderId', 'firstName lastName')
                .select('title uploaderId createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const stats = {
            totalUsers,
            totalResources,
            totalQuestions,
            totalDownloads: totalDownloads[0]?.totalDownloads || 0,
            topUploaders: topUploaders.map(user => ({
                name: `${user.firstName} ${user.lastName}`,
                uploads: user.uploadCount
            })),
            recentActivity: recentActivity.map(resource => ({
                title: resource.title,
                uploader: `${resource.uploaderId.firstName} ${resource.uploaderId.lastName}`,
                uploadedAt: resource.createdAt
            }))
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({ message: 'Error fetching platform statistics.' });
    }
};

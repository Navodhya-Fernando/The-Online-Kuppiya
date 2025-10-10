import api from './axios';

const LEADERBOARD_URL = '/leaderboard';

export const getLeaderboard = async (params = {}) => {
    try {
        const { type = 'reputation', limit = 10, page = 1 } = params;
        const response = await api.get(LEADERBOARD_URL, {
            params: { type, limit, page }
        });
        
        // Transform the backend response to match frontend expectations
        if (response.data && response.data.success) {
            return {
                users: response.data.leaderboard.map(item => ({
                    _id: item.user.id,
                    name: item.user.name,
                    university: item.user.university,
                    degree: item.user.degree,
                    avatar: item.user.avatar,
                    questionsAsked: item.stats.questionsAsked,
                    answersGiven: item.stats.answersGiven,
                    reputation: item.stats.reputation,
                    rank: item.rank
                })),
                platformStats: response.data.platformStats,
                pagination: response.data.pagination
            };
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
};

export const getUserStats = (userId) => {
    return api.get(`${LEADERBOARD_URL}/user/${userId}`);
};

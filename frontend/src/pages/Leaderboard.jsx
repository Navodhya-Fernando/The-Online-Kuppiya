import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/leaderboardApi';
import { Spinner } from '../components/shared/Spinner';

// --- Modern Inline Icons ---
const Icons = {
    Trophy: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Medal: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: () => <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    MessageCircle: () => <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    TrendingUp: () => <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
};

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fallbackUsers = [
        { _id: 'u1', name: 'Navodhya Fernando', university: 'NIBM', questionsAsked: 18, answersGiven: 42, reputation: 148, avatar: 'N' },
        { _id: 'u2', name: 'Sandrea Raj', university: 'NIBM', questionsAsked: 14, answersGiven: 38, reputation: 132, avatar: 'S' },
        { _id: 'u3', name: 'Hashini Handapangoda', university: 'NIBM', questionsAsked: 11, answersGiven: 31, reputation: 118, avatar: 'H' },
        { _id: 'u4', name: 'Study Circle', university: 'Community', questionsAsked: 9, answersGiven: 27, reputation: 101, avatar: 'C' },
        { _id: 'u5', name: 'David Chen', university: 'UCSC', questionsAsked: 5, answersGiven: 15, reputation: 85, avatar: 'D' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getLeaderboard();
                setLeaderboardData(response || { users: fallbackUsers, platformStats: { totalQuestions: 128, totalUsers: 48, totalAnswers: 341 } });
            } catch (err) {
                console.error('Leaderboard fetch error:', err);
                setLeaderboardData({ users: fallbackUsers, platformStats: { totalQuestions: 128, totalUsers: 48, totalAnswers: 341 } });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const { users = [], platformStats = {} } = leaderboardData || {};

    const statCards = [
        { label: 'Total Questions', value: platformStats.totalQuestions || 0, icon: <Icons.MessageCircle />, color: 'bg-purple-100 dark:bg-purple-900/30' },
        { label: 'Total Answers', value: platformStats.totalAnswers || 0, icon: <Icons.TrendingUp />, color: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Active Scholars', value: platformStats.totalUsers || 0, icon: <Icons.Users />, color: 'bg-blue-100 dark:bg-blue-900/30' },
    ];

    // Helpers to style top 3 differently
    const getRankStyles = (index) => {
        switch(index) {
            case 0: return {
                card: 'border-yellow-300 dark:border-yellow-600/50 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/10 dark:to-bg-secondary-dark shadow-sm ring-1 ring-yellow-400/20',
                badge: 'bg-yellow-400 text-yellow-900',
                icon: <Icons.Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            };
            case 1: return {
                card: 'border-gray-300 dark:border-gray-600/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-bg-secondary-dark',
                badge: 'bg-gray-300 text-gray-800',
                icon: <Icons.Medal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            };
            case 2: return {
                card: 'border-orange-300 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/10 dark:to-bg-secondary-dark',
                badge: 'bg-orange-300 text-orange-900',
                icon: <Icons.Medal className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            };
            default: return {
                card: 'border-gray-200 dark:border-border-default bg-white dark:bg-bg-secondary-dark hover:border-gray-300 dark:hover:border-border-light',
                badge: 'bg-gray-100 dark:bg-bg-tertiary-dark text-gray-600 dark:text-gray-400',
                icon: <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>
            };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark text-gray-900 dark:text-gray-100 font-sans py-12 transition-colors duration-200">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* --- Page Hero --- */}
                <div className="text-center mb-16 animate-fade-in">
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-4">
                        Community Leaderboard
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Contributors</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Recognizing the students and educators who go above and beyond to make learning collaborative and accessible.
                    </p>
                </div>

                {/* --- Platform Stats Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="bg-white dark:bg-bg-secondary-dark p-6 rounded-2xl border border-gray-200 dark:border-border-default shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loading ? <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-bg-tertiary-dark rounded animate-pulse" /> : card.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Leaderboard List --- */}
                <div className="space-y-4">
                    {loading ? (
                        // Loading Skeletons
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 bg-white dark:bg-bg-secondary-dark border border-gray-200 dark:border-border-default rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        users.map((user, index) => {
                            const styles = getRankStyles(index);
                            return (
                                <article 
                                    key={user._id} 
                                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-md ${styles.card}`}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
                                        {/* Rank Badge */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.badge}`}>
                                            {styles.icon}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-inner">
                                                {user.avatar || user.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                    {user.name}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {user.university || 'Community Member'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Array */}
                                    <div className="flex items-center gap-6 sm:gap-8 ml-14 sm:ml-0 border-t sm:border-t-0 border-gray-100 dark:border-border-default pt-4 sm:pt-0">
                                        <div className="text-center sm:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Asked</p>
                                            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{user.questionsAsked || 0}</p>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Answered</p>
                                            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{user.answersGiven || 0}</p>
                                        </div>
                                        <div className="text-center sm:text-right bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider mb-0.5">Rep</p>
                                            <p className="text-xl font-black text-blue-700 dark:text-blue-300">{user.reputation || 0}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default LeaderboardPage;
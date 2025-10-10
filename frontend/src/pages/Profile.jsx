import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../hooks/useApi';
import { getUserProfile } from '../api/authApi';
import { Spinner } from '../components/shared/Spinner';

// Icons for activity feed

const QuestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);
const AnswerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const response = await getUserProfile();
                if (response && response.data) {
                    setProfileData(response.data);
                } else {
                    // If API call fails, use user data from context
                    setProfileData(user);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                // Fallback to user data from context
                setProfileData(user);
                setError('Could not fetch latest profile data, showing cached data');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, navigate]);

    if (!user) {
        // This part should ideally not be reached if ProtectedRoute is working correctly
        return (
            <div className="no-results-message">
                <h3>Please log in to view your profile.</h3>
                <Link to="/login" className="btn-primary">Go to Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="no-results-message">
            <h3>Error loading profile</h3>
            <p>{error.message || 'Failed to load profile data'}</p>
        </div>;
    }

    // Handle the actual data structure from the backend
    const userProfile = profileData?.user || profileData || user;
    const { recentActivity = [], questions = [], answers = [] } = userProfile;

    // Fallback to empty arrays for now since we might not have this data
    const allContributions = [];


    const getActivityIcon = (type) => {
        switch (type) {
            case 'question': return <QuestionIcon />;
            case 'answer': return <AnswerIcon />;
            default: return <QuestionIcon />;
        }
    };

    const getActivityText = (item) => {
        switch (item.type) {
            case 'question': return <>Asked a new question: <Link to={`/question/${item._id}`} className="text-blue-400 hover:text-blue-300">{item.title}</Link></>;
            case 'answer': return <>Answered a question: <Link to={`/question/${item.questionId?._id || item.questionId}`} className="text-blue-400 hover:text-blue-300">{item.questionId?.title || 'a question'}</Link></>;
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 mb-8 overflow-hidden relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-blue-500/20">
                                        {profileData.avatar || user?.avatar || '👤'}
                                    </div>
                                </div>
                                
                                {/* User Info */}
                                <div className="text-center sm:text-left flex-grow">
                                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                                        {profileData.name || user?.name}
                                    </h1>
                                    <p className="text-blue-300 text-lg mb-6 font-medium">{profileData.email || user?.email}</p>
                                    
                                    <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                                        <div className="text-center bg-green-600/20 rounded-lg p-4 min-w-[80px]">
                                            <div className="text-3xl font-bold text-green-400 mb-1">{userProfile.reputation || 0}</div>
                                            <div className="text-sm text-green-200 font-medium">Reputation</div>
                                        </div>
                                        <div className="text-center bg-yellow-600/20 rounded-lg p-4 min-w-[80px]">
                                            <div className="text-3xl font-bold text-yellow-400 mb-1">{userProfile.questionCount || questions.length || 0}</div>
                                            <div className="text-sm text-yellow-200 font-medium">Questions</div>
                                        </div>
                                        <div className="text-center bg-indigo-600/20 rounded-lg p-4 min-w-[80px]">
                                            <div className="text-3xl font-bold text-indigo-400 mb-1">{userProfile.answerCount || answers.length || 0}</div>
                                            <div className="text-sm text-indigo-200 font-medium">Answers</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link 
                                        to="/edit-profile"
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                                    >
                                        Edit Profile
                                    </Link>
                                    <button 
                                        onClick={logout}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Activity Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Activity */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((item) => (
                                        <div key={item._id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                                                {getActivityIcon(item.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-gray-300 text-sm">{getActivityText(item)}</div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl text-gray-400">📝</span>
                                        </div>
                                        <p className="text-gray-400 font-medium">No recent activity to display.</p>
                                        <p className="text-gray-500 text-sm mt-1">Start asking questions and providing answers!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My Q&A Activity */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Q&A Activity
                            </h2>
                            <div className="space-y-4">
                                {allContributions.length > 0 ? (
                                    allContributions.map((item) => (
                                        <div key={item._id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 flex-shrink-0">
                                                {getActivityIcon(item.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-gray-300 text-sm">{getActivityText(item)}</div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl text-gray-400">🎯</span>
                                        </div>
                                        <p className="text-gray-400 font-medium">Your questions and answers will appear here.</p>
                                        <p className="text-gray-500 text-sm mt-1">Share your knowledge with the community!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../hooks/useApi';
import { getUserProfile } from '../api/authApi';
import { Spinner } from '../components/shared/Spinner';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const { loading, error, execute: fetchProfile } = useApi(getUserProfile);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile().then(res => setProfileData(res.data));
    }, [user, navigate, fetchProfile]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    const userProfile = profileData?.user || user;
    const { recentActivity = [], questions = [], answers = [], bio = '', achievements = [] } = userProfile;

    const getScholarLevel = (rep) => {
        if (rep < 50) return { label: 'Novice', color: 'text-gray-400' };
        if (rep < 200) return { label: 'Contributor', color: 'text-blue-400' };
        if (rep < 500) return { label: 'Scholar', color: 'text-purple-400' };
        return { label: 'Legend', color: 'text-yellow-400' };
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8 text-white">
            <div className="max-w-6xl mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700 shadow-xl flex flex-col md:flex-row gap-8">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg border-4 border-gray-700">
                        {userProfile.avatar}
                    </div>
                    
                    <div className="flex-grow">
                        <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                        <p className="text-blue-400">{userProfile.email}</p>
                        
                        {/* Bio Section */}
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">About Me</h4>
                            <p className="text-gray-300 italic">{bio || 'No bio yet. Click edit to tell your peers about yourself!'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/edit-profile" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-bold">Edit Profile</Link>
                        <button onClick={logout} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">Logout</button>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="bg-gray-800 p-6 rounded-2xl mb-8 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Achievements</h3>
                    <div className="flex gap-4">
                        {achievements.length > 0 ? achievements.map((ach, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full border border-gray-600">
                                <span>{ach.icon}</span>
                                <span className="text-sm font-medium">{ach.title}</span>
                            </div>
                        )) : <p className="text-gray-500 text-sm">Keep contributing to unlock badges!</p>}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                        <div className={`text-2xl font-bold ${getScholarLevel(userProfile.reputation).color}`}>
                            {getScholarLevel(userProfile.reputation).label}
                        </div>
                        <div className="text-sm text-gray-400">Reputation: {userProfile.reputation}</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{userProfile.questionCount || 0}</div>
                        <div className="text-sm text-gray-400">Questions Asked</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                        <div className="text-2xl font-bold text-indigo-400">{userProfile.answerCount || 0}</div>
                        <div className="text-sm text-gray-400">Answers Given</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
import React from 'react';

const LeaderboardPage = () => {
    // Placeholder data for the leaderboard UI
    const contributors = [
        { id: 1, username: "Anuruddha_A", uploads: 15, credits: 500, avatar: "AA" },
        { id: 2, username: "Sanda_G", uploads: 12, credits: 450, avatar: "SG" },
        { id: 3, username: "Chamika_P", uploads: 10, credits: 380, avatar: "CP" },
        { id: 4, username: "Nimasha_R", uploads: 8, credits: 320, avatar: "NR" },
        { id: 5, username: "Kavinda_M", uploads: 7, credits: 280, avatar: "KM" },
    ];

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">🏆</span>
                        </div>
                        <span className="font-bold text-lg text-yellow-400">#1</span>
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">🥈</span>
                        </div>
                        <span className="font-bold text-lg text-gray-400">#2</span>
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">🥉</span>
                        </div>
                        <span className="font-bold text-lg text-orange-400">#3</span>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center">
                        <span className="font-bold text-secondary">#{rank}</span>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <div className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-2xl mb-4">
                        <span className="text-3xl">🏆</span>
                    </div>
                    <h1 className="text-4xl font-bold text-primary mb-4">Top Contributors</h1>
                    <p className="text-secondary text-lg max-w-2xl mx-auto">
                        Celebrating our community heroes who share knowledge and help others succeed
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-secondary rounded-xl p-6 border border-light">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue bg-opacity-20 rounded-xl flex items-center justify-center">
                                <span className="text-blue text-xl">📚</span>
                            </div>
                            <div>
                                <p className="text-muted text-sm">Total Resources</p>
                                <p className="text-2xl font-bold text-primary">52</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-secondary rounded-xl p-6 border border-light">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green bg-opacity-20 rounded-xl flex items-center justify-center">
                                <span className="text-green text-xl">👥</span>
                            </div>
                            <div>
                                <p className="text-muted text-sm">Active Contributors</p>
                                <p className="text-2xl font-bold text-primary">5</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-secondary rounded-xl p-6 border border-light">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple bg-opacity-20 rounded-xl flex items-center justify-center">
                                <span className="text-purple text-xl">⭐</span>
                            </div>
                            <div>
                                <p className="text-muted text-sm">Total Credits</p>
                                <p className="text-2xl font-bold text-primary">2,130</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-secondary rounded-xl border border-light overflow-hidden">
                    <div className="p-6 border-b border-light">
                        <h2 className="text-xl font-semibold text-primary">Rankings</h2>
                        <p className="text-secondary text-sm mt-1">Based on contributions and community engagement</p>
                    </div>
                    
                    <div className="divide-y divide-light">
                        {contributors.map((contributor, index) => {
                            const rank = index + 1;
                            return (
                                <div key={contributor.id} className="p-6 hover:bg-tertiary transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {getRankIcon(rank)}
                                            
                                            <div className="w-12 h-12 bg-blue bg-opacity-20 rounded-xl flex items-center justify-center">
                                                <span className="text-blue font-semibold text-sm">{contributor.avatar}</span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-semibold text-primary group-hover:text-blue transition-colors">
                                                    {contributor.username}
                                                </h3>
                                                <p className="text-secondary text-sm">Student Contributor</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-primary">{contributor.uploads}</p>
                                                <p className="text-secondary text-xs">Resources</p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue">{contributor.credits}</p>
                                                <p className="text-secondary text-xs">Credits</p>
                                            </div>
                                            
                                            <button className="btn-secondary text-sm px-4 py-2">
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <div className="bg-secondary rounded-xl p-8 border border-light">
                        <h3 className="text-xl font-semibold text-primary mb-2">Want to climb the leaderboard?</h3>
                        <p className="text-secondary mb-6">Share your knowledge and help fellow students succeed</p>
                        <button className="btn-primary">
                            Upload Resource
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
import React from 'react';

const LeaderboardPage = () => {
    // Placeholder data for the leaderboard UI
    const contributors = [
        { id: 1, username: "Anuruddha_A", uploads: 15, credits: 500 },
        { id: 2, username: "Sanda_G", uploads: 12, credits: 450 },
        { id: 3, username: "Chamika_P", uploads: 10, credits: 380 },
    ];

    return (
        <div className="leaderboard-page container mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">Top Contributors (Leaderboard)</h1>
            
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-center">Rank</th>
                            <th className="py-3 px-6 text-left">Username</th>
                            <th className="py-3 px-6 text-center">Uploads</th>
                            <th className="py-3 px-6 text-center">Credits</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {contributors.map((contributor, index) => (
                            <tr key={contributor.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-center font-bold text-lg">{index + 1}</td>
                                <td className="py-3 px-6 text-left font-medium text-primary">{contributor.username}</td>
                                <td className="py-3 px-6 text-center">{contributor.uploads}</td>
                                <td className="py-3 px-6 text-center text-accent font-semibold">{contributor.credits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPage;
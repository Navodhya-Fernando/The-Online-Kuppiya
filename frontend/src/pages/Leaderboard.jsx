import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/leaderboardApi';
import { Spinner } from '../components/shared/Spinner';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackUsers = [
    { _id: 'u1', name: 'Navodhya Fernando', university: 'NIBM', questionsAsked: 18, answersGiven: 42, reputation: 148, avatar: 'N' },
    { _id: 'u2', name: 'Sandrea Raj', university: 'NIBM', questionsAsked: 14, answersGiven: 38, reputation: 132, avatar: 'S' },
    { _id: 'u3', name: 'Hashini Handapangoda', university: 'NIBM', questionsAsked: 11, answersGiven: 31, reputation: 118, avatar: 'H' },
    { _id: 'u4', name: 'Study Circle', university: 'Community', questionsAsked: 9, answersGiven: 27, reputation: 101, avatar: 'C' },
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
    { label: 'Total Questions', value: platformStats.totalQuestions || 0 },
    { label: 'Total Users', value: platformStats.totalUsers || 0 },
    { label: 'Total Answers', value: platformStats.totalAnswers || 0 },
  ];

  return (
    <div className="page-shell leaderboard-page">
      <div className="container">
        <div className="page-hero">
          <span className="hero-badge">Community leaderboard</span>
          <h1 className="page-title">People who make the forum better.</h1>
          <p className="page-subtitle">
            A simpler, more premium view that highlights the most helpful contributors without visual noise.
          </p>
        </div>

        <div className="summary-grid">
          {statCards.map((card) => (
            <article key={card.label} className="summary-card">
              <div className="summary-icon">★</div>
              <div>
                <span className="summary-label">{card.label}</span>
                <strong className="summary-value">{loading ? <span className="inline-skeleton" /> : card.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="leaderboard-panel">
          {loading ? (
            <div className="loading-state loading-state-compact">
              <Spinner />
              <span>Loading leaderboard...</span>
            </div>
          ) : (
            <div className="leaderboard-list">
              {users.map((user, index) => (
                <article key={user._id} className="leaderboard-card">
                  <div className="leaderboard-rank">
                    <span className={`leaderboard-badge ${index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : ''}`}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="leaderboard-user">
                    <div className="leaderboard-avatar">{user.avatar || user.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.university || 'Community member'}</span>
                    </div>
                  </div>

                  <div className="leaderboard-metrics">
                    <div>
                      <span>Questions</span>
                      <strong>{user.questionsAsked || 0}</strong>
                    </div>
                    <div>
                      <span>Answers</span>
                      <strong>{user.answersGiven || 0}</strong>
                    </div>
                    <div>
                      <span>Reputation</span>
                      <strong>{user.reputation || 0}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
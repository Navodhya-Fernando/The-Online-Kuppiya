import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllQuestions } from '../api/questionApi';
import { getLeaderboard } from '../api/leaderboardApi';
import useApi from '../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

const QuestionIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  const [notifications] = useState([
    { id: 1, type: 'answer', message: 'New answer to your question about React Hooks', time: '2 hours ago' },
    { id: 2, type: 'upvote', message: 'Your answer received 5 upvotes', time: '4 hours ago' },
    { id: 3, type: 'question', message: 'New question in Computer Science category', time: '1 day ago' }
  ]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetchAllQuestions();
        
        if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
          const questions = response.data.questions;
          
          // Get recent questions
          const recent = questions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentQuestions(recent);

          // Get top voted questions
          const topVoted = questions
            .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
            .slice(0, 5);
          setTopQuestions(topVoted);
        } else {
          setError('No questions available');
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Welcome to The Online Kuppiya
          </h1>
          <p className="hero-subtitle">
            A collaborative Q&A platform for Sri Lankan university students. Ask questions, share knowledge, and help each other grow.
          </p>
          {isAuthenticated ? (
            <div className="hero-actions">
              <Link
                to="/ask"
                className="btn-minimal-primary hero-btn"
              >
                <QuestionIcon />
                Ask a Question
              </Link>
              <Link
                to="/forum"
                className="btn-minimal hero-btn"
              >
                <ExploreIcon />
                Browse Questions
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link
                to="/register"
                className="btn-minimal-primary hero-btn"
              >
                Join Community
              </Link>
              <Link
                to="/login"
                className="btn-minimal hero-btn"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content Section with Tabs */}
      <div className="content-section">
        <div className="container">
          {isAuthenticated && (
            <div className="tab-container">
              <div className="tab-buttons">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                >
                  Recent Activity
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                >
                  Notifications ({notifications.length})
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {isAuthenticated && activeTab === 'notifications' && (
            <div className="notification-panel">
              <h2 className="section-title">Your Notifications</h2>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className={`notification-dot ${notification.type}`} />
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="question-grid">
            {/* Recent Questions */}
            <div className="question-card-container">
              <div className="card-header">
                <h2 className="section-title">Recent Questions</h2>
                <Link to="/forum" className="view-all-link">
                  View All →
                </Link>
              </div>
              
              {loading && (
                <div className="loading-state">
                  <div className="loading"></div>
                  <span>Loading questions...</span>
                </div>
              )}
              {error && (
                <div className="error-state">
                  <p>{error}</p>
                </div>
              )}
              {!loading && !error && recentQuestions.length === 0 && (
                <div className="empty-state">
                  <p>No questions found yet.</p>
                  <Link to="/ask" className="view-all-link">
                    Be the first to ask a question!
                  </Link>
                </div>
              )}
              
              <div className="question-list">
                {!loading && !error && recentQuestions.map(question => (
                  <div key={question._id} className="question-item">
                    <Link
                      to={`/question/${question._id}`}
                      className="question-title"
                    >
                      {question.title}
                    </Link>
                    <div className="question-meta">
                      <span>by {question.authorId?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{question.upvotes?.length || 0} votes</span>
                      <span>•</span>
                      <span>{question.answerCount || 0} answers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Questions */}
            <div className="question-card-container">
              <div className="card-header">
                <h2 className="section-title">Top Questions</h2>
                <Link to="/leaderboard" className="view-all-link">
                  View Leaderboard →
                </Link>
              </div>
              
              {loading && (
                <div className="loading-state">
                  <div className="loading"></div>
                  <span>Loading top questions...</span>
                </div>
              )}
              {error && (
                <div className="error-state">
                  <p>{error}</p>
                </div>
              )}
              {!loading && !error && topQuestions.length === 0 && (
                <div className="empty-state">
                  <p>No questions to display yet.</p>
                </div>
              )}
              
              <div className="question-list">
                {!loading && !error && topQuestions.map(question => (
                  <div key={question._id} className="question-item">
                    <Link
                      to={`/question/${question._id}`}
                      className="question-title"
                    >
                      {question.title}
                    </Link>
                    <div className="question-meta">
                      <span className="vote-count">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {question.upvotes?.length || 0}
                      </span>
                      <span>•</span>
                      <span>{question.answerCount || 0} answers</span>
                      <span>•</span>
                      <span>{question.courseCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {!isAuthenticated && (
            <div className="cta-section">
              <h3 className="cta-title">
                Ready to Join the Community?
              </h3>
              <p className="cta-subtitle">
                Connect with fellow Sri Lankan university students, ask questions, share knowledge, and collaborate on your academic journey.
              </p>
              <Link
                to="/register"
                className="btn-minimal-primary cta-button"
              >
                Get Started Today
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

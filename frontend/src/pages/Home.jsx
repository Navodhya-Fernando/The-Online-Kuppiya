import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllQuestions } from '../api/questionApi';
import { getLeaderboard } from '../api/leaderboardApi';
import { formatDistanceToNow } from 'date-fns';

const QuestionIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SparkIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 3l2 7h7l-5.5 4 2 7L13 16l-5.5 5 2-7L4 10h7l2-7z" />
  </svg>
);

const fallbackQuestions = [
  {
    _id: 'fallback-1',
    title: 'What is the best way to structure a final year project?',
    authorId: { name: 'Community Team' },
    createdAt: new Date().toISOString(),
    answerCount: 4,
    upvotes: [1, 2, 3],
    courseCode: 'PROJECT'
  },
  {
    _id: 'fallback-2',
    title: 'How do I prepare for viva questions with confidence?',
    authorId: { name: 'Study Circle' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    answerCount: 2,
    upvotes: [1, 2],
    courseCode: 'ACADEMIC'
  },
  {
    _id: 'fallback-3',
    title: 'Which learning resources are best for database design?',
    authorId: { name: 'Mentor' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    answerCount: 3,
    upvotes: [1, 2, 3, 4],
    courseCode: 'DBMS'
  },
  {
    _id: 'fallback-4',
    title: 'How do I stay consistent during exam season?',
    authorId: { name: 'Campus Lead' },
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    answerCount: 5,
    upvotes: [1],
    courseCode: 'STUDY'
  },
];

const fallbackContributors = [
  { _id: 'c1', name: 'Navodhya Fernando', reputation: 128 },
  { _id: 'c2', name: 'Sandrea Raj', reputation: 112 },
  { _id: 'c3', name: 'Hashini Handapangoda', reputation: 96 },
];

const workspaceItems = [
  { label: 'Courses', value: '12 active', tone: 'blue' },
  { label: 'Saved', value: '24 items', tone: 'green' },
  { label: 'Pinboard', value: '8 pinned', tone: 'gold' },
];

const tagCloud = ['#CS101', '#Lab3', '#DataFrame-Errors', '#Project', '#Viva', '#DBMS'];

const insightCards = [
  { title: 'Verified answer stack', copy: 'Instructor answers stay pinned above the noise.', badge: 'Pinned' },
  { title: 'TA queue ready', copy: 'Unresolved questions can escalate cleanly.', badge: '2h rule' },
  { title: 'Anonymous with accountability', copy: 'Students can ask freely while staff keeps visibility.', badge: 'Private' },
];

const heroImageUrl = 'https://freepngimg.com/save/166448-college-student-download-free-image/1712x1110';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [stats, setStats] = useState({ questions: 0, answers: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHome = async () => {
      try {
        setLoading(true);
        setError(null);

        const [questionsResult, leaderboardResult] = await Promise.allSettled([
          fetchAllQuestions(),
          getLeaderboard({ limit: 3 }),
        ]);

        const questions = questionsResult.status === 'fulfilled' ? questionsResult.value?.data?.questions || [] : [];
        const sourceQuestions = questions.length > 0 ? questions : fallbackQuestions;
        const recent = [...sourceQuestions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
        const top = [...sourceQuestions].sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)).slice(0, 4);
        const sourceContributors = leaderboardResult.status === 'fulfilled' && leaderboardResult.value?.users
          ? leaderboardResult.value.users.slice(0, 3)
          : fallbackContributors;

        setRecentQuestions(recent);
        setTopQuestions(top);
        setStats({
          questions: sourceQuestions.length,
          answers: sourceQuestions.reduce((count, question) => count + (question.answerCount || 0), 0),
          contributors: sourceContributors.length,
        });

        if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value?.users) {
          setTopContributors(sourceContributors);
          setStats((previous) => ({
            questions: leaderboardResult.value.platformStats?.totalQuestions ?? previous.questions,
            answers: leaderboardResult.value.platformStats?.totalAnswers ?? previous.answers,
            contributors: leaderboardResult.value.platformStats?.totalUsers ?? previous.contributors,
          }));
        } else {
          setTopContributors(sourceContributors);
        }
      } catch (requestError) {
        console.error(requestError);
        setRecentQuestions(fallbackQuestions.slice(0, 4));
        setTopQuestions([...fallbackQuestions].sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)).slice(0, 4));
        setTopContributors(fallbackContributors);
        setStats({ questions: fallbackQuestions.length, answers: 14, contributors: fallbackContributors.length });
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const heroActions = isAuthenticated
    ? [
        { to: '/ask', label: 'Ask a question', primary: true, icon: QuestionIcon },
        { to: '/forum', label: 'Browse discussions', primary: false, icon: ExploreIcon },
      ]
    : [
        { to: '/register', label: 'Get started', primary: true, icon: SparkIcon },
        { to: '/login', label: 'Sign in', primary: false, icon: ExploreIcon },
      ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-layout">
          <aside className="home-rail home-rail-left">
            <div className="rail-card rail-card-solid">
              <span className="panel-kicker">Workspace</span>
              <h3>Everything you need in one place.</h3>
              <p>Fast navigation, saved items, and course context without the clutter.</p>
              <div className="workspace-list">
                {workspaceItems.map((item) => (
                  <div key={item.label} className={`workspace-pill tone-${item.tone}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="rail-card">
              <span className="panel-kicker">Tags</span>
              <div className="tag-cloud">
                {tagCloud.map((tag) => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            </div>
          </aside>

          <div className="hero-copy">
            <span className="hero-badge">Live study community</span>
            <h1 className="hero-title">A calmer way to ask, answer, and keep moving.</h1>
            <p className="hero-subtitle">
              A premium learning space for Sri Lankan university students. Ask once, scan less, and get straight to the useful answer.
            </p>

            <div className="hero-actions">
              {heroActions.map((action) => (
                <Link key={action.to} to={action.to} className={`btn-minimal hero-btn ${action.primary ? 'btn-minimal-primary' : ''}`}>
                  <action.icon />
                  {action.label}
                </Link>
              ))}
            </div>

            <div className="hero-preview-card">
              <img
                src={heroImageUrl}
                alt="College student studying with laptop"
                className="hero-image"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="hero-image-overlay">
                <span className="overlay-chip">Campus focus</span>
                <strong>Study less, find the answer faster.</strong>
              </div>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">01</div>
                <h3>Fast asking</h3>
                <p>A cleaner flow with fewer choices and less friction.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">02</div>
                <h3>Easy scanning</h3>

            <div className="insight-stack">
              {insightCards.map((card) => (
                <article key={card.title} className="insight-card">
                  <div className="insight-card-header">
                    <span className="panel-chip subtle">{card.badge}</span>
                  </div>
                  <strong>{card.title}</strong>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
                <p>The highest-value content is surfaced first.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">03</div>
                <h3>Visible progress</h3>
                <p>Contribution history and reputation stay readable.</p>
              </article>
            </div>
          </div>

          <aside className="hero-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Community snapshot</span>
                <h2>Live signals</h2>
              </div>
              <span className="panel-chip">{loading ? 'Syncing' : 'Live'}</span>
            </div>

            {loading ? (
              <div className="loading-state loading-state-compact">
                <div className="loading"></div>
                <span>Loading community highlights...</span>
              </div>
            ) : (
              <>
                <div className="hero-stats-grid">
                  <article className="hero-stat-card">
                    <div className="hero-stat-icon"><QuestionIcon /></div>
                    <div>
                      <span className="hero-stat-value">{stats.questions}</span>
                      <span className="hero-stat-label">Questions</span>
                    </div>
                  </article>
                  <article className="hero-stat-card">
                    <div className="hero-stat-icon"><SparkIcon /></div>
                    <div>
                      <span className="hero-stat-value">{stats.answers}</span>
                      <span className="hero-stat-label">Answers</span>
                    </div>
                  </article>
                  <article className="hero-stat-card">
                    <div className="hero-stat-icon"><ExploreIcon /></div>
                    <div>
                      <span className="hero-stat-value">{stats.contributors}</span>
                      <span className="hero-stat-label">Contributors</span>
                    </div>
                  </article>
                </div>

                {topContributors.length > 0 && (
                  <div className="mini-leaderboard">
                    <div className="mini-leaderboard-header">
                      <span className="panel-kicker">Top contributors</span>
                      <Link to="/leaderboard" className="view-all-link">View board →</Link>
                    </div>
                    <div className="mini-leaderboard-list">
                      {topContributors.map((user, index) => (
                        <div key={user._id || user.name || index} className="mini-leaderboard-item">
                          <div className="mini-leaderboard-rank">#{index + 1}</div>
                          <div className="mini-leaderboard-body">
                            <strong>{user.name}</strong>
                            <span>{user.reputation || 0} reputation</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="question-grid">
            <article className="question-card-container">
              <div className="card-header">
                <h2 className="section-title">Recent Questions</h2>
                <Link to="/forum" className="view-all-link">View all →</Link>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="loading"></div>
                  <span>Loading questions...</span>
                </div>
              )}

              {!loading && recentQuestions.length === 0 && (
                <div className="empty-state">
                  <p>No questions yet.</p>
                  <Link to="/ask" className="view-all-link">Be the first to ask →</Link>
                </div>
              )}

              <div className="question-list">
                {!loading && recentQuestions.map((question) => (
                  <div key={question._id} className="question-item">
                    <Link to={`/question/${question._id}`} className="question-title">{question.title}</Link>
                    <div className="question-meta">
                      <span>by {question.authorId?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{question.answerCount || 0} answers</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="question-card-container">
              <div className="card-header">
                <h2 className="section-title">Top Questions</h2>
                <Link to="/leaderboard" className="view-all-link">Leaderboard →</Link>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="loading"></div>
                  <span>Loading top questions...</span>
                </div>
              )}

              {!loading && topQuestions.length === 0 && (
                <div className="empty-state">
                  <p>No high-signal posts yet.</p>
                </div>
              )}

              <div className="question-list">
                {!loading && topQuestions.map((question) => (
                  <div key={question._id} className="question-item">
                    <Link to={`/question/${question._id}`} className="question-title">{question.title}</Link>
                    <div className="question-meta">
                      <span className="vote-count">{question.upvotes?.length || 0} votes</span>
                      <span>•</span>
                      <span>{question.answerCount || 0} answers</span>
                      <span>•</span>
                      <span>{question.courseCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {!isAuthenticated && (
            <div className="cta-section">
              <h3 className="cta-title">Start cleanly. Stay focused.</h3>
              <p className="cta-subtitle">
                A simpler space for students who want quick answers and a nicer place to study.
              </p>
              <Link to="/register" className="btn-minimal btn-minimal-primary cta-button">Create account</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
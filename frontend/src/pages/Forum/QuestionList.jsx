import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllQuestions, voteQuestion } from '../../api/questionApi';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/shared/Spinner';
import { formatDistanceToNow } from 'date-fns';

const PlusIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const SearchIcon = () => (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('most_recent');

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await fetchAllQuestions();
            // Access response.data since axios returns the full response object
            if (response && response.data && response.data.success && response.data.questions) {
                setQuestions(response.data.questions);
            } else {
                setError('Failed to load questions');
            }
        } catch (err) {
            console.error('Questions fetch error:', err);
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (questionId, voteType) => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        
        try {
            const response = await voteQuestion(questionId, voteType);
            if (response && response.data && response.data.success) {
                // Update local state with new vote counts
                setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                        q._id === questionId ? { ...q, upvotes: response.data.upvotes, downvotes: response.data.downvotes } : q
                    )
                );
            }
        } catch (err) {
            console.error('Vote error:', err);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, []);



    const sortAndFilterQuestions = (list) => {
        if (!list || !Array.isArray(list)) return [];
        let sorted = [...list];
        switch (filter) {
            case 'most_answered':
                sorted.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
                break;
            case 'most_recent':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        return sorted.filter(q =>
            q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    };

    const questionsList = questions || [];
    const filteredQuestions = sortAndFilterQuestions(questionsList);

    const handleQuestionClick = (questionId) => {
        navigate(`/question/${questionId}`);
    };

    const filterOptions = [
        { value: 'most_recent', label: 'Most Recent' },
        { value: 'most_answered', label: 'Most Answered' },
    ];

    return (
        <div className="modern-forum">
            <div className="container">
                {/* Modern Header */}
                <div className="modern-header">
                    <div className="header-content">
                        <h1 className="modern-title">Q&A Forum</h1>
                        <p className="modern-subtitle">Ask questions, share knowledge, and help each other learn</p>
                    </div>
                    {user && (
                        <Link to="/ask" className="ask-btn-modern">
                            <PlusIcon />
                            Ask Question
                        </Link>
                    )}
                </div>

                {/* Modern Search Bar */}
                <div className="search-bar-modern">
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search questions, topics, or courses..."
                            className="search-input-modern"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="filter-modern" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {filterOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Questions Content */}
                {loading ? (
                    <div className="loading-modern">
                        <Spinner />
                        <span>Loading questions...</span>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <h3>⚠️ Something went wrong</h3>
                        <p>We couldn't load the questions. Please try refreshing the page.</p>
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    <div className="questions-modern">
                        {filteredQuestions.map(q => (
                            <article key={q._id} className="question-modern" onClick={() => handleQuestionClick(q._id)}>
                                {/* Vote Section */}
                                <div className="vote-panel">
                                    <button 
                                        className={`vote-modern thumbs-up ${q.upvotes?.includes(user?._id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(q._id, 'upvote');
                                        }}
                                        title="Upvote this question"
                                    >
                                        👍
                                    </button>
                                    <span className="vote-score">
                                        {(q.upvotes?.length || 0) - (q.downvotes?.length || 0)}
                                    </span>
                                    <button 
                                        className={`vote-modern thumbs-down ${q.downvotes?.includes(user?._id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(q._id, 'downvote');
                                        }}
                                        title="Downvote this question"
                                    >
                                        👎
                                    </button>
                                </div>

                                {/* Question Content */}
                                <div className="question-body">
                                    <div className="question-header-modern">
                                        <h3 className="title-modern">{q.title}</h3>
                                        <span className="course-badge">{q.courseCode}</span>
                                    </div>

                                    {q.tags && q.tags.length > 0 && (
                                        <div className="tags-modern">
                                            {q.tags.map(tag => (
                                                <span key={tag} className="tag-modern">{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="question-footer">
                                        <div className="author-modern">
                                            <span className="author-name-modern">{q.authorId?.name || 'Anonymous'}</span>
                                            <span className="time-modern">{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        
                                        <div className="stats-modern">
                                            <span className="stat-modern">
                                                💬 {q.answerCount || 0} answers
                                            </span>
                                            <span className="stat-modern">
                                                👁️ {q.viewCount || 0} views
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="empty-modern">
                        <div className="empty-icon">🤔</div>
                        <h3>No questions yet</h3>
                        <p>Be the first to start a discussion!</p>
                        {user && (
                            <Link to="/ask" className="btn-minimal btn-minimal-primary">
                                Ask the First Question
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionList;
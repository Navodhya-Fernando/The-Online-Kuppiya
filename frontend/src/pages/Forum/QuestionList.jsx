import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllQuestions } from '../../api/questionApi';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const QuestionList = () => {
  const { data: questions, loading, error, execute: loadQuestions } = useApi(fetchAllQuestions);
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const filteredQuestions = questions?.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedQuestions = filteredQuestions?.sort((a, b) => {
    switch(sortBy) {
      case 'popular':
        return (b.answerCount || 0) - (a.answerCount || 0);
      case 'unanswered':
        return (a.answerCount || 0) - (b.answerCount || 0);
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const getQuestionStats = () => {
    if (!questions) return { total: 0, answered: 0, unanswered: 0 };
    
    const answered = questions.filter(q => (q.answerCount || 0) > 0).length;
    return {
      total: questions.length,
      answered,
      unanswered: questions.length - answered
    };
  };

  const stats = getQuestionStats();

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-2xl mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Q&A Forum</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Get help from the community and share your knowledge with fellow students
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary rounded-xl p-6 border border-light text-center">
            <div className="text-3xl font-bold text-blue">{stats.total}</div>
            <div className="text-sm text-muted">Total Questions</div>
          </div>
          <div className="bg-secondary rounded-xl p-6 border border-light text-center">
            <div className="text-3xl font-bold text-green">{stats.answered}</div>
            <div className="text-sm text-muted">Answered</div>
          </div>
          <div className="bg-secondary rounded-xl p-6 border border-light text-center">
            <div className="text-3xl font-bold text-orange">{stats.unanswered}</div>
            <div className="text-sm text-muted">Need Answers</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-secondary rounded-xl p-6 mb-8 border border-light">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted">🔍</span>
              </div>
              <input 
                type="text"
                placeholder="Search questions by title or course code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10 w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="input-primary pr-10 appearance-none cursor-pointer"
              >
                <option value="recent">🕐 Most Recent</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="unanswered">❓ Unanswered</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-muted">▼</span>
              </div>
            </div>

            {/* Ask Question Button */}
            {isAuthenticated && (
              <Link to="/forum/ask" className="btn-primary whitespace-nowrap">
                <span>❓</span>
                Ask Question
              </Link>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-secondary rounded-xl border border-light">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-tertiary rounded-xl mb-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue border-t-transparent rounded-full"></div>
              </div>
              <p className="text-secondary">Loading questions...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red bg-opacity-20 rounded-xl mb-4">
                <span className="text-red text-xl">⚠️</span>
              </div>
              <p className="text-red font-semibold">Failed to load questions</p>
              <button onClick={loadQuestions} className="btn-secondary mt-4">
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {sortedQuestions && sortedQuestions.length > 0 ? (
                <div className="divide-y divide-light">
                  {sortedQuestions.map((question, index) => (
                    <div key={question._id} className="p-6 hover:bg-tertiary transition-colors group">
                      <div className="flex items-start gap-4">
                        
                        {/* Question Status */}
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                            (question.answerCount || 0) > 0 
                              ? 'bg-green bg-opacity-20 text-green' 
                              : 'bg-orange bg-opacity-20 text-orange'
                          }`}>
                            {question.answerCount || 0}
                          </div>
                          <span className="text-xs text-muted">answers</span>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/forum/question/${question._id}`} 
                            className="block group-hover:text-blue transition-colors"
                          >
                            <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-blue">
                              {question.title}
                            </h3>
                          </Link>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-secondary mb-2">
                            <span className="inline-flex items-center gap-1">
                              <span>📚</span>
                              <span className="text-blue font-medium">{question.courseCode}</span>
                            </span>
                            
                            <span className="inline-flex items-center gap-1">
                              <span>👤</span>
                              <span>{question.authorId?.username || 'Anonymous'}</span>
                            </span>
                            
                            <span className="inline-flex items-center gap-1">
                              <span>🕐</span>
                              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {/* Tags/Categories */}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue bg-opacity-20 text-blue rounded-lg text-xs">
                              {question.category || 'General'}
                            </span>
                            {(question.answerCount || 0) === 0 && (
                              <span className="px-2 py-1 bg-orange bg-opacity-20 text-orange rounded-lg text-xs">
                                Needs Answer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link 
                          to={`/forum/question/${question._id}`} 
                          className="btn-secondary text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-xl mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No questions found</h3>
                  <p className="text-secondary mb-6">
                    {searchTerm ? 'Try different search terms' : 'Be the first to start a discussion!'}
                  </p>
                  {isAuthenticated && !searchTerm && (
                    <Link to="/forum/ask" className="btn-primary">
                      <span>❓</span>
                      Ask First Question
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Community Guidelines */}
        {!isAuthenticated && (
          <div className="mt-8 bg-secondary rounded-xl p-6 border border-light text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Join the Discussion</h3>
            <p className="text-secondary mb-4">Login to ask questions and help fellow students</p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className="btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn-outline">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionList;
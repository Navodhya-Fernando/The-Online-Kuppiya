import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllQuestions, voteQuestion } from '../../api/questionApi';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/shared/Spinner';
import { formatDistanceToNow } from 'date-fns';

// --- Modern Inline Icons ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Sparkles: () => <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Upvote: ({ active }) => <svg className={`w-6 h-6 ${active ? 'text-blue-500 fill-blue-100 dark:fill-blue-900/30' : 'text-gray-400 hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    Downvote: ({ active }) => <svg className={`w-6 h-6 ${active ? 'text-red-500 fill-red-100 dark:fill-red-900/30' : 'text-gray-400 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    MessageSquare: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    CheckCircle: () => <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

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
            if (response?.data?.success && response.data.questions) {
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
            navigate('/login');
            return;
        }
        try {
            const response = await voteQuestion(questionId, voteType);
            if (response?.data?.success) {
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
            case 'unanswered':
                sorted = sorted.filter(q => !q.answerCount || q.answerCount === 0);
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

    const filteredQuestions = sortAndFilterQuestions(questions);

    const filterTabs = [
        { id: 'most_recent', label: 'Recent' },
        { id: 'most_answered', label: 'Top Discussed' },
        { id: 'unanswered', label: 'Unanswered' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
                
                {/* --- LEFT RAIL: Navigation (Hidden on small screens) --- */}
                <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
                    <div className="bg-white dark:bg-bg-secondary-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-border-default">
                        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Feeds</h2>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors">
                                <Icons.Search /> All Questions
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-bg-tertiary-dark rounded-lg font-medium transition-colors">
                                <Icons.CheckCircle /> My Courses
                            </button>
                        </nav>
                    </div>
                    
                    <div className="bg-white dark:bg-bg-secondary-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-border-default">
                        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Popular Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {['#CS101', '#Calculus', '#ReactJS', '#LabReport', '#Algorithms'].map(tag => (
                                <span key={tag} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-bg-tertiary-dark text-gray-600 dark:text-gray-300 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- CENTER FEED: Core Content --- */}
                <main className="flex-1 min-w-0 flex flex-col gap-6">
                    {/* Header & Ask Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Discussion Forum</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ask questions, collaborate, and resolve blockers instantly.</p>
                        </div>
                        {user && (
                            <Link to="/ask" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-500/30 transition-all active:scale-95">
                                <Icons.Plus /> Ask a Question
                            </Link>
                        )}
                    </div>

                    {/* AI-Assisted Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icons.Search />
                        </div>
                        <input
                            type="text"
                            placeholder="Describe your issue or paste an error log..."
                            className="w-full pl-11 pr-12 py-4 bg-white dark:bg-bg-secondary-dark border border-gray-200 dark:border-border-default rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base placeholder-gray-400 dark:placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Icons.Sparkles />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-border-default pb-px">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                    filter === tab.id 
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Questions List */}
                    <div className="flex flex-col gap-4 pb-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Spinner />
                                <span className="mt-4 font-medium">Fetching knowledge...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
                                <h3 className="text-red-800 dark:text-red-400 font-bold mb-1">⚠️ Connection Interrupted</h3>
                                <p className="text-red-600 dark:text-red-300 text-sm">We couldn't reach the servers. Please try refreshing the page.</p>
                            </div>
                        ) : filteredQuestions.length > 0 ? (
                            filteredQuestions.map(q => {
                                const upvotes = q.upvotes?.length || 0;
                                const downvotes = q.downvotes?.length || 0;
                                const score = upvotes - downvotes;

                                return (
                                    <article 
                                        key={q._id} 
                                        onClick={() => navigate(`/question/${q._id}`)}
                                        className="group flex gap-4 bg-white dark:bg-bg-secondary-dark p-5 rounded-2xl border border-gray-200 dark:border-border-default shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-border-light cursor-pointer transition-all"
                                    >
                                        {/* Voting Column (Stack Overflow Style) */}
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleVote(q._id, 'upvote'); }}
                                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-bg-tertiary-dark transition-colors"
                                            >
                                                <Icons.Upvote active={q.upvotes?.includes(user?._id)} />
                                            </button>
                                            <span className={`text-lg font-bold ${score > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {score}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleVote(q._id, 'downvote'); }}
                                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-bg-tertiary-dark transition-colors"
                                            >
                                                <Icons.Downvote active={q.downvotes?.includes(user?._id)} />
                                            </button>
                                        </div>

                                        {/* Question Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                {q.courseCode && (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                                        {q.courseCode}
                                                    </span>
                                                )}
                                                {/* Mocking a Verified checkmark for layout purposes */}
                                                {q.answerCount > 0 && (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                        <Icons.CheckCircle /> Solved
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                {q.title}
                                            </h3>

                                            {q.tags && q.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {q.tags.map(tag => (
                                                        <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-bg-tertiary-dark text-gray-600 dark:text-gray-400 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-border-default/50">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {(q.authorId?.name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{q.authorId?.name || 'Anonymous'}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icons.MessageSquare />
                                                        <span className={q.answerCount > 0 ? 'text-gray-700 dark:text-gray-300' : ''}>
                                                            {q.answerCount || 0} answers
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Icons.Eye />
                                                        <span>{q.viewCount || 0} views</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white dark:bg-bg-secondary-dark rounded-2xl border border-dashed border-gray-300 dark:border-border-default">
                                <div className="text-4xl mb-4">🤔</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">We couldn't find any questions matching your current filters. Be the first to start this discussion!</p>
                                {user && (
                                    <Link to="/ask" className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-6 py-2.5 rounded-xl font-semibold transition-colors">
                                        <Icons.Plus /> Ask a Question
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* --- RIGHT RAIL: Context (Hidden on smaller screens) --- */}
                <aside className="hidden xl:flex flex-col w-72 shrink-0 space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg text-white">
                        <h3 className="font-bold mb-2">TA Office Hours</h3>
                        <p className="text-sm text-blue-100 mb-4">CS101 Lab Support is currently active. Get real-time help.</p>
                        <button className="w-full bg-white text-blue-700 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors">
                            Join Voice Channel
                        </button>
                    </div>

                    <div className="bg-white dark:bg-bg-secondary-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-border-default">
                        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Top Contributors</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Dr. Sarah Jenkins', role: 'Instructor', points: '1.2k' },
                                { name: 'Alex M.', role: 'Student TA', points: '850' },
                                { name: 'David C.', role: 'Student', points: '420' }
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-bg-tertiary-dark flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-blue-500">{user.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default QuestionList;
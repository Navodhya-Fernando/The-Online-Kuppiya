import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchQuestionDetails, postNewAnswer, voteQuestion, voteAnswer, verifyAnswer } from '../../api/questionApi';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/shared/Spinner';
import RichTextRenderer from '../../components/shared/RichTextRenderer';
import { fetchQuestionDetails, postNewAnswer, voteQuestion, voteAnswer, verifyAnswer, deleteQuestion, deleteAnswer } from '../../api/questionApi';
import { formatDistanceToNow } from 'date-fns';

// --- Modern Inline Icons ---
const Icons = {
    ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    CheckCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ShieldCheck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Upvote: ({ active }) => <svg className={`w-7 h-7 ${active ? 'text-blue-500 fill-blue-100 dark:fill-blue-900/30' : 'text-gray-400 hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    Downvote: ({ active }) => <svg className={`w-7 h-7 ${active ? 'text-red-500 fill-red-100 dark:fill-red-900/30' : 'text-gray-400 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    MessageSquare: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
};

const QuestionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { data, loading, error, execute: loadQuestion } = useApi(fetchQuestionDetails);

    const [answerBody, setAnswerBody] = useState('');
    const { loading: answerLoading, error: answerError, execute: submitAnswer } = useApi(postNewAnswer);
    const { execute: voteOnQuestion } = useApi(voteQuestion);
    const { execute: voteOnAnswer } = useApi(voteAnswer);
    const { execute: toggleVerifyAnswer } = useApi(verifyAnswer);

    useEffect(() => {
        if (id) {
            loadQuestion(id);
        }
    }, [id, loadQuestion]);

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!answerBody.trim()) return;

        await submitAnswer(id, { content: answerBody });
        
        if (!answerError) {
            setAnswerBody('');
            loadQuestion(id); 
        }
    };

    const handleQuestionVote = async (voteType) => {
        if (!isAuthenticated) return navigate('/login');
        try {
            await voteOnQuestion(id, voteType);
            loadQuestion(id);
        } catch (error) {
            console.error('Vote failed:', error);
        }
    };

    const handleAnswerVote = async (answerId, voteType) => {
        if (!isAuthenticated) return navigate('/login');
        try {
            await voteOnAnswer(answerId, voteType);
            loadQuestion(id);
        } catch (error) {
            console.error('Vote failed:', error);
        }
    };

    // --- TA/Instructor Verification Logic ---
    const handleVerify = async (answerId) => {
        if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) return;
        try {
            await toggleVerifyAnswer(id, answerId);
            loadQuestion(id);
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
        try {
            await deleteQuestion(id); // Ensure this exists in your questionApi.js
            navigate('/questions'); // Redirect back to the forum
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm('Are you sure you want to delete this answer?')) return;
        try {
            await deleteAnswer(answerId); // Ensure this exists in your questionApi.js
            loadQuestion(id); // Reload the thread to remove the answer
        } catch (error) {
            console.error('Failed to delete answer:', error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading thread...</p>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark flex flex-col items-center justify-center p-4">
            <div className="text-6xl mb-4">🛸</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thread not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">This question might have been removed or the link is broken.</p>
            <Link to="/questions" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
                <Icons.ArrowLeft /> Back to Discussions
            </Link>
        </div>
    );

    const { question, answers } = data;
    const qScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
    
    // Check if the current logged-in user is staff
    const isStaff = user?.role === 'instructor' || user?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
                
                {/* --- CENTER FEED: Question & Answers --- */}
                <main className="flex-1 min-w-0 flex flex-col gap-8">
                    
                    <div>
                        <Link to="/questions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
                            <Icons.ArrowLeft /> Back to all questions
                        </Link>
                        
                        <div className="pb-6 border-b border-gray-200 dark:border-border-default">
                            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{question.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                                <span>•</span>
                                <span>Viewed {question.viewCount || 0} times</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 sm:gap-6">
                        {/* Voting Column */}
                        <div className="flex flex-col items-center gap-2 shrink-0 pt-2">
                            <button onClick={() => handleQuestionVote('up')} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-bg-tertiary-dark transition-colors">
                                <Icons.Upvote active={question.upvotes?.includes(user?._id)} />
                            </button>
                            <span className={`text-xl font-bold ${qScore > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {qScore}
                            </span>
                            <button onClick={() => handleQuestionVote('down')} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-bg-tertiary-dark transition-colors">
                                <Icons.Downvote active={question.downvotes?.includes(user?._id)} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {question.courseCode && (
                                    <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                                        {question.courseCode}
                                    </span>
                                )}
                                {question.tags?.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-bg-tertiary-dark text-gray-600 dark:text-gray-300 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                                {isAuthenticated && (user?._id === question.authorId?._id || user?.role === 'admin') && (
                                    <button 
                                        onClick={handleDeleteQuestion} 
                                        className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                    >
                                        <Icons.Trash /> Delete Question
                                    </button>
                                )}
                            </div>

                            {/* Using the new RichTextRenderer */}
                            <div className="mb-8">
                                <RichTextRenderer content={question.body} />
                            </div>

                            <div className="flex justify-end">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 min-w-[200px] border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Asked by</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            {(question.authorId?.name || 'A')[0].toUpperCase()}
                                        </div>
                                        <div className="font-medium text-blue-900 dark:text-blue-100">
                                            {question.authorId?.name || 'Anonymous'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answers Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-border-default">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                        </h2>

                        <div className="space-y-8">
                            {/* Sort answers so verified ones float to the top naturally */}
                            {[...answers].sort((a, b) => (b.verifiedByInstructor ? 1 : 0) - (a.verifiedByInstructor ? 1 : 0)).map(answer => {
                                const aScore = (answer.upvotes?.length || 0) - (answer.downvotes?.length || 0);
                                const isVerified = answer.verifiedByInstructor; // New backend property

                                return (
                                    <div 
                                        key={answer._id} 
                                        className={`flex gap-4 sm:gap-6 p-6 rounded-2xl border transition-all ${
                                            isVerified 
                                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-300 dark:border-green-800 shadow-sm ring-1 ring-green-500/20' 
                                            : 'bg-white dark:bg-bg-secondary-dark border-gray-200 dark:border-border-default shadow-sm'
                                        }`}
                                    >
                                        {/* Answer Voting */}
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <button onClick={() => handleAnswerVote(answer._id, 'up')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-bg-tertiary-dark transition-colors">
                                                <Icons.Upvote active={answer.upvotes?.includes(user?._id)} />
                                            </button>
                                            <span className={`text-xl font-bold ${aScore > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {aScore}
                                            </span>
                                            <button onClick={() => handleAnswerVote(answer._id, 'down')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-bg-tertiary-dark transition-colors">
                                                <Icons.Downvote active={answer.downvotes?.includes(user?._id)} />
                                            </button>
                                        </div>

                                        {/* Answer Body */}
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            
                                            {/* Verification Badge & TA Controls */}
                                            <div className="flex items-center gap-3 mb-4">
                                                {isVerified && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 rounded-full shadow-sm">
                                                        <Icons.ShieldCheck /> Instructor Verified
                                                    </span>
                                                )}
                                                
                                                {/* TA Toggle Button */}
                                                {isStaff && !isVerified && (
                                                    <button 
                                                        onClick={() => handleVerify(answer._id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-green-100 hover:text-green-700 dark:bg-bg-tertiary-dark dark:text-gray-300 dark:hover:bg-green-900/40 dark:hover:text-green-400 rounded-full transition-colors border border-dashed border-gray-300 dark:border-gray-600 hover:border-solid hover:border-green-300 dark:hover:border-green-700"
                                                    >
                                                        <Icons.Shield /> Mark as Verified
                                                    </button>
                                                )}
                                                {isStaff && isVerified && (
                                                    <button 
                                                        onClick={() => handleVerify(answer._id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        Un-verify
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 mb-6">
                                                <RichTextRenderer content={answer.content} />
                                            </div>
                                            
                                            <div className="flex justify-end mt-auto">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <span>Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })} by</span>
                                                    <span className={`font-semibold ${answer.authorId?.role === 'instructor' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                        {answer.authorId?.name || 'Anonymous'}
                                                        {answer.authorId?.role === 'instructor' && ' (Staff)'}
                                                    </span>
                                                    {isAuthenticated && (user?._id === answer.authorId?._id || user?.role === 'admin') && (
                                                        <button 
                                                            onClick={() => handleDeleteAnswer(answer._id)} 
                                                            className="ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                                            title="Delete answer"
                                                        >
                                                            <Icons.Trash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Compose Answer Form */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-border-default pb-16">
                        <h3 className="text-xl font-bold mb-4">Your Answer</h3>
                        {isAuthenticated ? (
                            <form onSubmit={handleAnswerSubmit} className="bg-white dark:bg-bg-secondary-dark border border-gray-200 dark:border-border-default rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                                <textarea
                                    className="w-full min-h-[200px] p-6 bg-transparent outline-none resize-y text-gray-900 dark:text-gray-100 placeholder-gray-400 font-mono text-sm"
                                    value={answerBody}
                                    onChange={(e) => setAnswerBody(e.target.value)}
                                    placeholder="Write your explanation here. Use ``` for code blocks and $$ for math formulas..."
                                    required
                                />
                                <div className="bg-gray-50 dark:bg-bg-tertiary-dark border-t border-gray-200 dark:border-border-default px-4 py-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Markdown & LaTeX supported. Be polite and clearly explain your logic.</span>
                                    <button 
                                        type="submit" 
                                        disabled={answerLoading || !answerBody.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        {answerLoading && <Spinner size="sm" />}
                                        Post Answer
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 text-center">
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Join the Discussion</h4>
                                <p className="text-blue-700 dark:text-blue-300 mb-4">You need to log in to post an answer and help your peers.</p>
                                <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                    Log In to Answer
                                </Link>
                            </div>
                        )}
                        {answerError && (
                            <div className="mt-4 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                                ⚠️ {answerError.message || 'Failed to post answer. Please try again.'}
                            </div>
                        )}
                    </div>
                </main>

                {/* --- RIGHT RAIL: Thread Context --- */}
                <aside className="hidden lg:flex flex-col w-72 shrink-0 space-y-6">
                    <div className="bg-white dark:bg-bg-secondary-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-border-default">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Thread Status</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex justify-between">
                                <span>Status:</span>
                                <span className={answers.some(a => a.verifiedByInstructor) ? 'text-green-600 dark:text-green-400 font-bold' : 'text-yellow-600 dark:text-yellow-400 font-bold'}>
                                    {answers.some(a => a.verifiedByInstructor) ? 'Resolved' : 'Active'}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>Answers:</span>
                                <span className="font-medium">{answers.length}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Views:</span>
                                <span className="font-medium">{question.viewCount || 0}</span>
                            </li>
                        </ul>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default QuestionDetails;
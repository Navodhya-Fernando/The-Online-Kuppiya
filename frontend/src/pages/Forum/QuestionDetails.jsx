import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestionDetails, postNewAnswer, voteQuestion, voteAnswer } from '../../api/questionApi';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/shared/Spinner';
import { formatDistanceToNow } from 'date-fns';

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.398.83 1.169 1.398 2.02 1.398h.718c.728 0 1.428-.301 1.936-.837l.361-.381c.376-.395.923-.621 1.48-.621a2.25 2.25 0 1 1 0 4.5H9.117c-.889 0-1.713-.518-2.118-1.336L5.904 18.5Z" />
    </svg>
);

const ThumbsDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.ter.83-1.169 1.398-2.02 1.398h-.718c-.728 0-1.428.301-1.936.837l-.361.381c-.376.395-.923.621-1.48.621a2.25 2.25 0 1 1 0-4.5h3.632c.889 0 1.713.518 2.118 1.336L18.096 5.5Z" />
    </svg>
);

const QuestionDetails = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const { data, loading, error, execute: loadQuestion } = useApi(fetchQuestionDetails);

    const [answerBody, setAnswerBody] = useState('');
    const { loading: answerLoading, error: answerError, execute: submitAnswer } = useApi(postNewAnswer);
    const { execute: voteOnQuestion } = useApi(voteQuestion);
    const { execute: voteOnAnswer } = useApi(voteAnswer);

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
            loadQuestion(id); // Re-fetch to show the new answer
        }
    };

    const handleQuestionVote = async (voteType) => {
        if (!isAuthenticated) return;
        try {
            await voteOnQuestion(id, voteType);
            loadQuestion(id); // Re-fetch to update vote counts
        } catch (error) {
            console.error('Vote failed:', error);
            // Still refresh to show current state
            loadQuestion(id);
        }
    };

    const handleAnswerVote = async (answerId, voteType) => {
        if (!isAuthenticated) return;
        try {
            await voteOnAnswer(answerId, voteType);
            loadQuestion(id); // Re-fetch to update vote counts
        } catch (error) {
            console.error('Vote failed:', error);
            // Still refresh to show current state
            loadQuestion(id);
        }
    };

    if (loading) return <div className="loading-spinner-container"><Spinner /></div>;
    if (error) return <div className="no-results-message"><h3>Error loading question.</h3><p>The requested question could not be found or the connection failed.</p></div>;
    if (!data) return <div className="no-results-message"><h3>Question not found.</h3></div>;

    const { question, answers } = data;

    return (
        <div className="question-details-page">
            <div className="container">
                <div className="question-details-card">
                    <div className="question-header">
                        <h1 className="question-title">{question.title}</h1>
                        <div className="question-meta">
                            {question.courseCode && <span className="tag-modern">{question.courseCode}</span>}
                            {question.tags?.map((tag, index) => (
                                <span key={index} className="tag-modern">{tag}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="question-content">
                        <p className="question-body-text">{question.body}</p>
                    </div>
                    
                    <div className="question-footer">
                        <div className="question-voting">
                            {isAuthenticated && (
                                <div className="vote-controls">
                                    <button 
                                        onClick={() => handleQuestionVote('up')}
                                        className={`vote-btn vote-up ${question.upvotes?.includes(user?._id) ? 'active' : ''}`}
                                    >
                                        👍 {question.upvotes?.length || 0}
                                    </button>
                                    <button 
                                        onClick={() => handleQuestionVote('down')}
                                        className={`vote-btn vote-down ${question.downvotes?.includes(user?._id) ? 'active' : ''}`}
                                    >
                                        👎 {question.downvotes?.length || 0}
                                    </button>
                                </div>
                            )}
                            <div className="rating-display">
                                Rating: {(question.upvotes?.length || 0) - (question.downvotes?.length || 0)}
                            </div>
                        </div>
                        <div className="question-author-info">
                            Asked by <span className="author-name">{question.authorId?.name || 'Anonymous'}</span>
                            <span className="separator">•</span>
                            <span className="timestamp">{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>

                <div className="answers-section">
                    <h2 className="answers-title">{answers.length} Answers</h2>
                    <div className="answers-list">
                        {answers.map(answer => (
                            <div key={answer._id} className={`answer-card-modern ${answer.isAccepted ? 'accepted' : ''}`}>
                                <div className="answer-header-modern">
                                    <div className="answer-author-info">
                                        <span className="answer-author">Answered by <span className="author-name">{answer.authorId?.name || 'Anonymous'}</span></span>
                                        <span className="answer-timestamp">{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    {answer.isAccepted && (
                                        <div className="accepted-badge-modern">
                                            <CheckCircleIcon />
                                            <span>Accepted Answer</span>
                                        </div>
                                    )}
                                </div>
                                <div className="answer-content">
                                    <p className="answer-text">{answer.content}</p>
                                </div>
                                <div className="answer-footer-modern">
                                    <div className="answer-voting">
                                        {isAuthenticated && (
                                            <div className="vote-controls">
                                                <button 
                                                    onClick={() => handleAnswerVote(answer._id, 'up')}
                                                    className={`vote-btn vote-up ${answer.upvotes?.includes(user?._id) ? 'active' : ''}`}
                                                >
                                                    👍 {answer.upvotes?.length || 0}
                                                </button>
                                                <button 
                                                    onClick={() => handleAnswerVote(answer._id, 'down')}
                                                    className={`vote-btn vote-down ${answer.downvotes?.includes(user?._id) ? 'active' : ''}`}
                                                >
                                                    👎 {answer.downvotes?.length || 0}
                                                </button>
                                            </div>
                                        )}
                                        <div className="rating-display">
                                            Rating: {(answer.upvotes?.length || 0) - (answer.downvotes?.length || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {isAuthenticated && (
                    <div className="answer-form-section">
                        <h3 className="answer-form-title">Your Answer</h3>
                        <form onSubmit={handleAnswerSubmit} className="answer-form-modern">
                            <textarea
                                className="answer-input"
                                value={answerBody}
                                onChange={(e) => setAnswerBody(e.target.value)}
                                placeholder="Share your knowledge..."
                                required
                            />
                            {answerError && <div className="error-alert">{answerError.message || 'Failed to post answer.'}</div>}
                            <button type="submit" className="btn-primary" disabled={answerLoading}>
                                {answerLoading ? <Spinner size="sm" /> : 'Post Answer'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetails;
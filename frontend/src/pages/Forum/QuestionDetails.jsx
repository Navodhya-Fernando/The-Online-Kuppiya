import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestionDetails, postNewAnswer } from '../../api/questionApi';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const QuestionDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { data, loading, error, execute: loadQuestion } = useApi(fetchQuestionDetails);
  
  // State for posting a new answer
  const [answerBody, setAnswerBody] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  useEffect(() => {
    if (id) {
        loadQuestion(id);
    }
  }, [id, loadQuestion]);

  // Handle posting an answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    
    setAnswerLoading(true);
    setAnswerError(null);

    try {
        const response = await postNewAnswer(id, { body: answerBody });
        setAnswerBody('');
        // Manually update the data state to include the new answer
        loadQuestion(id); // Re-fetch to update all counts/ordering
    } catch (err) {
        setAnswerError(err.response?.data?.message || 'Failed to post answer.');
    } finally {
        setAnswerLoading(false);
    }
  };


  if (loading) return <div className="container text-center mt-10">Loading question details...</div>;
  if (error) return <div className="container text-red-600 mt-10">Error: Question not found or connection failed.</div>;
  if (!data) return <div className="container text-gray-500 mt-10">No question data available.</div>;

  const { question, answers } = data;

  return (
    <div className="question-details-page container max-w-5xl mx-auto p-8 mt-10">
      
      {/* Question Section */}
      <div className="bg-white shadow-xl rounded-lg p-6 mb-8 border-t-4 border-primary-blue">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{question.title}</h1>
        
        <div className="flex space-x-2 text-sm text-gray-500 mb-4">
            <span className="bg-gray-200 px-3 py-1 rounded-full font-semibold">{question.courseCode}</span>
            {question.tags?.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{tag}</span>
            ))}
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{question.body}</p>
        
        <div className="flex justify-between items-center text-sm mt-6 pt-4 border-t">
          <div>
            <span className="font-semibold text-green-600">Upvotes: {question.upvotes}</span>
          </div>
          <div className="text-right">
            <p>Asked by: <span className="font-medium text-primary-blue">{question.authorId?.username || 'System User'}</span></p>
            <p className="text-xs text-gray-500">on {new Date(question.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <h2 className="text-2xl font-bold mb-4 mt-10 text-gray-800">{answers.length} Answers</h2>
      
      <div className="space-y-6">
        {answers.map(answer => (
          <div key={answer._id} className={`answer-card bg-white shadow-md p-5 rounded-lg border ${answer.isAccepted ? 'border-green-500 border-2' : 'border-gray-200'}`}>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{answer.body}</p>
            
            {answer.isAccepted && (
                <span className="text-green-600 font-bold text-sm flex items-center mb-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Accepted Answer
                </span>
            )}

            <div className="flex justify-between items-center text-sm pt-3 border-t">
              <div>
                <span className="font-semibold text-blue-600">Upvotes: {answer.upvotes}</span>
              </div>
              <div className="text-right">
                <p>Answered by: <span className="font-medium text-primary-blue">{answer.authorId?.username || 'System User'}</span></p>
                <p className="text-xs text-gray-500">on {new Date(answer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Your Answer</h3>
        
        {!isAuthenticated ? (
            <p className="text-red-500">You must be logged in to post an answer.</p>
        ) : (
            <form onSubmit={handleAnswerSubmit}>
                <textarea 
                    className="form-control mb-4" 
                    placeholder="Type your detailed answer here..." 
                    value={answerBody} 
                    onChange={(e) => setAnswerBody(e.target.value)} 
                    required 
                    rows="6"
                />
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={answerLoading}
                >
                    {answerLoading ? 'Submitting...' : 'Post Your Answer'}
                </button>
                {answerError && <p className="mt-2 text-red-500 text-sm">{answerError}</p>}
            </form>
        )}
      </div>
    </div>
  );
};

export default QuestionDetails;
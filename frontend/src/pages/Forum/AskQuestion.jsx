import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postNewQuestion } from '../../api/questionApi';
import useApi from '../../hooks/useApi';

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const { loading, error, execute: handlePost } = useApi(postNewQuestion);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    courseCode: '',
    tags: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await handlePost(formData);
      setMessage('Question posted successfully!');
      // Navigate to the new question's detail page
      navigate(`/question/${response._id}`); 
    } catch (err) {
      // Error handled by useApi, but we display the message
      setMessage(`Post failed: ${error || 'An error occurred.'}`);
    }
  };

  return (
    <div className="ask-question-page container max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Ask a New Question</h1>
      <form onSubmit={handleSubmit}>
        <input 
          className="form-control" 
          name="title" 
          placeholder="A brief, descriptive title (e.g., Why does MongoDB use JSON?)" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
        <textarea 
          className="form-control" 
          name="body" 
          placeholder="Explain your problem or question in detail." 
          value={formData.body} 
          onChange={handleChange} 
          required 
          rows="10" 
        />
        <input 
          className="form-control" 
          name="courseCode" 
          placeholder="Course Code (e.g., ADDS242F - Optional)" 
          value={formData.courseCode} 
          onChange={handleChange} 
        />
        <input 
          className="form-control" 
          name="tags" 
          placeholder="Tags (comma-separated: react, mongodb, node - Optional)" 
          value={formData.tags} 
          onChange={handleChange} 
        />
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </form>
      
      {message && <p className={`mt-4 text-center font-semibold ${error ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </div>
  );
};

export default AskQuestionPage;
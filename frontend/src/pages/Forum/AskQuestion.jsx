import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { postNewQuestion } from '../../api/questionApi';
import { Spinner } from '../../components/shared/Spinner';

const AskQuestionPage = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [tags, setTags] = useState('');

    const navigate = useNavigate();
    const { loading, error, execute: doAskQuestion } = useApi(postNewQuestion);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const questionData = {
            title,
            body,
            courseCode,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        };

        try {
            const data = await doAskQuestion(questionData);
            if (data && data.success && data.question) {
                navigate(`/question/${data.question._id}`);
            } else if (data && data._id) {
                // In case the backend returns the question directly
                navigate(`/question/${data._id}`);
            } else {
                // Fallback navigation to forum list
                navigate('/forum');
            }
        } catch (err) {
            // Error is already handled by useApi hook and displayed
            console.error("Failed to post question:", err);
        }
    };

    return (
        <div className="ask-question-page">
            <div className="container">
                <div className="ask-question-card">
                    <div className="ask-question-header">
                        <h1 className="page-title">Ask a Public Question</h1>
                        <p className="page-subtitle">Get help from the community by asking a clear and detailed question.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="ask-question-form">
                        <div className="form-section">
                            <div className="form-field">
                                <label htmlFor="title" className="field-label">Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    className="field-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., How do I implement authentication in a MERN stack app?"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="body" className="field-label">Body</label>
                                <textarea
                                    id="body"
                                    className="field-textarea"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Include all the information someone would need to answer your question. You can use Markdown for formatting."
                                    required
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="courseCode" className="field-label">Subject / Course Code</label>
                                    <input
                                        id="courseCode"
                                        type="text"
                                        className="field-input"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        placeholder="e.g., SE3040"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="tags" className="field-label">Tags</label>
                                    <input
                                        id="tags"
                                        type="text"
                                        className="field-input"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g., react, nodejs"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-alert">{`Error: ${error}`}</div>}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Post Your Question'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AskQuestionPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { postNewQuestion } from '../../api/questionApi';
import { Spinner } from '../../components/shared/Spinner';

// --- Modern Inline Icons ---
const Icons = {
    ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Lightbulb: () => <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    CheckCircle: () => <svg className="w-4 h-4 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Code: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Sparkles: () => <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
};

const AskQuestionPage = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [tags, setTags] = useState('');
    const [activeField, setActiveField] = useState(null);

    // --- Duplicate Prevention State ---
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const navigate = useNavigate();
    const { loading, error, execute: doAskQuestion } = useApi(postNewQuestion);

    // --- Duplicate Prevention Logic (Debounced Search) ---
    useEffect(() => {
        // Only search if the user has typed a meaningful phrase (e.g., > 10 chars)
        if (title.trim().length < 10) {
            setSuggestedQuestions([]);
            setShowSuggestions(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                // TODO: Replace this mock with your actual API call. 
                // Example: const results = await searchQuestionsAPI(title);
                
                // MOCK RESPONSE for demonstration:
                // We simulate finding a duplicate if the user types words like "react", "error", "how to"
                const lowerTitle = title.toLowerCase();
                if (lowerTitle.includes('react') || lowerTitle.includes('error') || lowerTitle.includes('how')) {
                    setSuggestedQuestions([
                        { _id: 'mock1', title: 'How to resolve React useEffect circular dependencies?', hasAcceptedAnswer: true, answers: 3 },
                        { _id: 'mock2', title: 'Why am I getting a Network Error on Axios post?', hasAcceptedAnswer: false, answers: 1 },
                    ]);
                    setShowSuggestions(true);
                } else {
                    setSuggestedQuestions([]);
                    setShowSuggestions(false);
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms delay to prevent spamming the database

        return () => clearTimeout(delayDebounceFn);
    }, [title]);

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
            if (data?.success && data.question) navigate(`/question/${data.question._id}`);
            else if (data?._id) navigate(`/question/${data._id}`);
            else navigate('/questions');
        } catch (err) {
            console.error("Failed to post question:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark text-gray-900 dark:text-gray-100 font-sans py-8 transition-colors duration-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
                
                {/* --- LEFT: Form Section --- */}
                <main className="flex-1 min-w-0">
                    <Link to="/questions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
                        <Icons.ArrowLeft /> Back to Discussions
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Ask a Public Question</h1>
                        <p className="text-gray-500 dark:text-gray-400">Be clear, concise, and provide enough context for the community to help you.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Title Field with Duplicate Prevention */}
                        <div className="relative">
                            <div className={`bg-white dark:bg-bg-secondary-dark p-6 rounded-2xl border transition-all duration-200 ${activeField === 'title' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-border-default shadow-sm hover:border-gray-300 dark:hover:border-border-light'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="title" className="block text-base font-semibold">Title</label>
                                    {isSearching && <Spinner size="sm" className="text-blue-500" />}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Be specific and imagine you're asking a question to another person.</p>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onFocus={() => setActiveField('title')}
                                    onBlur={() => {
                                        setActiveField(null);
                                        // Delay hiding suggestions so clicks register
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    placeholder="e.g., How do I resolve a circular dependency in my React useEffect?"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-primary-dark border border-gray-200 dark:border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {/* Smart Suggestions Dropdown */}
                            {showSuggestions && suggestedQuestions.length > 0 && (
                                <div className="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-bg-secondary-dark border border-blue-200 dark:border-blue-900/50 rounded-xl shadow-xl overflow-hidden animate-slide-up">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
                                        <Icons.Sparkles />
                                        <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Wait, has this already been answered?</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-border-default">
                                        {suggestedQuestions.map(sq => (
                                            <a 
                                                key={sq._id} 
                                                href={`/question/${sq._id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block p-4 hover:bg-gray-50 dark:hover:bg-bg-tertiary-dark transition-colors group"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                                                        {sq.title}
                                                    </p>
                                                    {sq.hasAcceptedAnswer ? (
                                                        <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 px-2 py-1 rounded-md">
                                                            <Icons.CheckCircle /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-bg-tertiary-dark px-2 py-1 rounded-md">
                                                            {sq.answers} answers
                                                        </span>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Body Field */}
                        <div className={`bg-white dark:bg-bg-secondary-dark rounded-2xl border overflow-hidden transition-all duration-200 ${activeField === 'body' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-border-default shadow-sm hover:border-gray-300 dark:hover:border-border-light'}`}>
                            <div className="p-6 pb-3 border-b border-gray-100 dark:border-border-default/50">
                                <label htmlFor="body" className="block text-base font-semibold mb-1">Details & Context</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Introduce the problem and expand on what you put in the title. Markdown and LaTeX are supported!</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-bg-tertiary-dark border-b border-gray-200 dark:border-border-default px-4 py-2 flex gap-2">
                                <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded font-bold transition-colors">B</button>
                                <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded italic transition-colors">I</button>
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2 self-center"></div>
                                <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded font-mono text-sm flex items-center transition-colors">
                                    <Icons.Code />
                                </button>
                            </div>

                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                onFocus={() => setActiveField('body')}
                                onBlur={() => setActiveField(null)}
                                placeholder="Describe what you tried, expected, and what actually resulted. Use ``` for code blocks and $$ for math formulas."
                                className="w-full min-h-[300px] p-6 bg-white dark:bg-bg-secondary-dark outline-none resize-y text-gray-900 dark:text-gray-100 placeholder-gray-400 leading-relaxed font-mono text-sm"
                                required
                            />
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`bg-white dark:bg-bg-secondary-dark p-6 rounded-2xl border transition-all duration-200 ${activeField === 'course' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-border-default shadow-sm hover:border-gray-300 dark:hover:border-border-light'}`}>
                                <label htmlFor="courseCode" className="block text-base font-semibold mb-1">Course Code</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Optional. Helps peers find related course materials.</p>
                                <input
                                    id="courseCode"
                                    type="text"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                                    onFocus={() => setActiveField('course')}
                                    onBlur={() => setActiveField(null)}
                                    placeholder="e.g., CS101"
                                    className="w-full px-4 py-3 font-mono bg-gray-50 dark:bg-bg-primary-dark border border-gray-200 dark:border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all uppercase placeholder:normal-case"
                                />
                            </div>

                            <div className={`bg-white dark:bg-bg-secondary-dark p-6 rounded-2xl border transition-all duration-200 ${activeField === 'tags' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-border-default shadow-sm hover:border-gray-300 dark:hover:border-border-light'}`}>
                                <label htmlFor="tags" className="block text-base font-semibold mb-1">Tags</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Add up to 5 comma-separated keywords.</p>
                                <input
                                    id="tags"
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    onFocus={() => setActiveField('tags')}
                                    onBlur={() => setActiveField(null)}
                                    placeholder="e.g., react, javascript, assignment-3"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-primary-dark border border-gray-200 dark:border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
                                <span>⚠️</span>
                                <p className="font-medium">{error.message || 'Failed to post question. Please try again.'}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-border-default">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all active:scale-95 flex items-center gap-2"
                            >
                                {loading ? <Spinner size="sm" /> : 'Publish Question'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate(-1)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium px-4 py-3 transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </form>
                </main>

                {/* --- RIGHT: Educational Guidelines Rail --- */}
                <aside className="w-full lg:w-80 shrink-0 space-y-6 mt-14">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Icons.Lightbulb />
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">How to ask a great question</h3>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
                            The community is here to help you learn. Writing a good question increases your chances of getting a fast, accurate answer.
                        </p>
                        
                        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100 mb-2">Steps to Success:</h4>
                        <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-start gap-2">
                                <Icons.CheckCircle />
                                <span><strong>Summarize</strong> the problem clearly in the title.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icons.CheckCircle />
                                <span><strong>Describe</strong> what you've already tried and why it didn't work.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icons.CheckCircle />
                                <span><strong>Include code</strong> or error logs. Use ``` to format code correctly.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icons.CheckCircle />
                                <span><strong>Tag correctly</strong> to alert peers studying the same topics.</span>
                            </li>
                        </ul>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default AskQuestionPage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllQuestions } from '../api/questionApi';
import { getLeaderboard } from '../api/leaderboardApi';
import { SettingsProvider } from "./contexts/SettingsContext";
import { formatDistanceToNow } from 'date-fns';

// --- Modern Inline Icons ---
const Icons = {
    Question: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Explore: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Spark: () => <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    ArrowRight: () => <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Fire: () => <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
    Clock: () => <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// --- Mock Data Fallbacks ---
const fallbackQuestions = [
    { _id: 'f1', title: 'What is the best way to structure a final year project?', authorId: { name: 'Community Team' }, createdAt: new Date().toISOString(), answerCount: 4, upvotes: [1, 2, 3], courseCode: 'CS401' },
    { _id: 'f2', title: 'How do I resolve a circular dependency in React useEffect?', authorId: { name: 'Study Circle' }, createdAt: new Date(Date.now() - 3600000).toISOString(), answerCount: 2, upvotes: [1, 2], courseCode: 'SE304' },
];

const fallbackContributors = [
    { _id: 'c1', name: 'Navodhya Fernando', reputation: 128 },
    { _id: 'c2', name: 'Sandrea Raj', reputation: 112 },
    { _id: 'c3', name: 'Hashini H.', reputation: 96 },
];

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [recentQuestions, setRecentQuestions] = useState([]);
    const [topQuestions, setTopQuestions] = useState([]);
    const [topContributors, setTopContributors] = useState([]);
    const [stats, setStats] = useState({ questions: 0, answers: 0, contributors: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHome = async () => {
            try {
                setLoading(true);
                const [questionsResult, leaderboardResult] = await Promise.allSettled([
                    fetchAllQuestions(),
                    getLeaderboard({ limit: 3 }),
                ]);

                const questions = questionsResult.status === 'fulfilled' ? questionsResult.value?.data?.questions || [] : [];
                const sourceQuestions = questions.length > 0 ? questions : fallbackQuestions;
                
                setRecentQuestions([...sourceQuestions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4));
                setTopQuestions([...sourceQuestions].sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)).slice(0, 4));
                
                const sourceContributors = leaderboardResult.status === 'fulfilled' && leaderboardResult.value?.users
                    ? leaderboardResult.value.users.slice(0, 3) : fallbackContributors;
                setTopContributors(sourceContributors);

                setStats({
                    questions: leaderboardResult.value?.platformStats?.totalQuestions || sourceQuestions.length,
                    answers: leaderboardResult.value?.platformStats?.totalAnswers || sourceQuestions.reduce((acc, q) => acc + (q.answerCount || 0), 0),
                    contributors: leaderboardResult.value?.platformStats?.totalUsers || sourceContributors.length,
                });
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadHome();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-primary-dark text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            
            {/* --- HERO SECTION --- */}
            <section className="relative overflow-hidden bg-white dark:bg-bg-secondary-dark border-b border-gray-200 dark:border-border-default">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-10 pointer-events-none"></div>
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 flex flex-col items-center text-center">
                    
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-6 animate-fade-in border border-blue-100 dark:border-blue-800/50">
                        <Icons.Spark /> The Modern Campus Network
                    </span>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl animate-slide-up">
                        Stop getting stuck. <br className="hidden md:block"/>
                        Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">learning faster.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        A premium Q&A space for university students. Ask once, scan less, and get straight to the instructor-verified answer without the clutter.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {isAuthenticated ? (
                            <>
                                <Link to="/ask" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-sm shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                                    <Icons.Question /> Ask a Question
                                </Link>
                                <Link to="/questions" className="w-full sm:w-auto bg-white dark:bg-bg-tertiary-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-border-default px-8 py-3.5 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-lg">
                                    <Icons.Explore /> Browse Discussions
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-sm shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                                    Join the Community <Icons.ArrowRight />
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold px-6 py-3.5 transition-colors">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* --- DASHBOARD GRID --- */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Tags & Stats */}
                    <aside className="space-y-8">
                        {/* Live Platform Stats */}
                        <div className="bg-white dark:bg-bg-secondary-dark rounded-3xl p-6 border border-gray-200 dark:border-border-default shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Network Pulse
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Icons.Question /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                                        <p className="text-xl font-bold">{loading ? <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-bg-tertiary-dark rounded animate-pulse" /> : stats.questions}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Icons.Spark /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Solutions Found</p>
                                        <p className="text-xl font-bold">{loading ? <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-bg-tertiary-dark rounded animate-pulse" /> : stats.answers}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><Icons.Users /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Scholars</p>
                                        <p className="text-xl font-bold">{loading ? <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-bg-tertiary-dark rounded animate-pulse" /> : stats.contributors}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="bg-white dark:bg-bg-secondary-dark rounded-3xl p-6 border border-gray-200 dark:border-border-default shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Top Contributors</h3>
                                <Link to="/leaderboard" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    [...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-bg-tertiary-dark rounded-lg animate-pulse" />)
                                ) : (
                                    topContributors.map((user, idx) => (
                                        <div key={user._id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-gray-100 text-gray-600 dark:bg-bg-tertiary-dark dark:text-gray-300'}`}>
                                                    {user.name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-blue-500">{user.reputation} rep</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER & RIGHT: Feeds */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Trending Questions */}
                        <div className="bg-white dark:bg-bg-secondary-dark rounded-3xl p-2 sm:p-6 border border-gray-200 dark:border-border-default shadow-sm">
                            <div className="px-4 pt-4 pb-2 sm:p-0 mb-4 flex items-center justify-between border-b border-gray-100 dark:border-border-default sm:border-0">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Icons.Fire /> Trending Discussions
                                </h2>
                                <Link to="/questions" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                                    More <Icons.ArrowRight />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {loading ? (
                                    [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-50 dark:bg-bg-tertiary-dark rounded-2xl animate-pulse" />)
                                ) : (
                                    topQuestions.map(q => (
                                        <Link key={q._id} to={`/question/${q._id}`} className="block p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-border-default/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm bg-gray-50/50 dark:bg-bg-primary-dark/50 transition-all group">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">{q.title}</h3>
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                                                    ▲ {q.upvotes?.length || 0} votes
                                                </span>
                                                <span>💬 {q.answerCount || 0} answers</span>
                                                {q.courseCode && <span className="bg-gray-200 dark:bg-bg-tertiary-dark text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">{q.courseCode}</span>}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-2">
                                <Icons.Clock /> Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {loading ? (
                                    [...Array(2)].map((_, i) => <div key={i} className="h-20 bg-white dark:bg-bg-secondary-dark rounded-2xl animate-pulse" />)
                                ) : (
                                    recentQuestions.map(q => (
                                        <Link key={q._id} to={`/question/${q._id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-bg-secondary-dark border border-gray-200 dark:border-border-default shadow-sm hover:shadow-md transition-all group">
                                            <div className="mb-2 sm:mb-0">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 line-clamp-1">{q.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Asked by {q.authorId?.name || 'Anonymous'} • {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-bg-tertiary-dark px-3 py-1.5 rounded-lg self-start sm:self-auto">
                                                {q.answerCount || 0} answers
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
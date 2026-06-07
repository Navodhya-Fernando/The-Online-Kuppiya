import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

// Import CSS for math equations and code highlighting
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css'; // A sleek, modern dark theme for code blocks

const RichTextRenderer = ({ content }) => {
    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                    // Customizing standard markdown elements to match our modern UI
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0 text-gray-800 dark:text-gray-200 leading-relaxed" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-border-default pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200 marker:text-gray-400" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-800 dark:text-gray-200 marker:text-gray-400" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 text-gray-600 dark:text-gray-400 italic bg-blue-50/50 dark:bg-blue-900/10 rounded-r-xl" {...props} />
                    ),
                    // Handling inline code vs block code snippet styling
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="bg-gray-100 dark:bg-bg-tertiary-dark text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md text-sm font-mono border border-gray-200 dark:border-gray-700" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ node, ...props }) => (
                        <pre className="p-4 bg-[#0d1117] dark:bg-[#0d1117] rounded-xl overflow-x-auto my-6 border border-gray-200 dark:border-border-default shadow-sm text-sm font-mono leading-relaxed" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-border-default border border-gray-200 dark:border-border-default rounded-lg" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="px-4 py-3 bg-gray-50 dark:bg-bg-tertiary-dark text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-border-default" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default RichTextRenderer;
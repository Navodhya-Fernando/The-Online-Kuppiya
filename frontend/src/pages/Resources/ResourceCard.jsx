import React from 'react';

const ResourceCard = ({ resource }) => {
  const CardIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 16h-2v-6h2v6zm0-8h-2V7h2v3z"/></svg>);

  return (
    <div className="resource-card bg-background-page hover:bg-background-page/70 transition duration-200 shadow-lg p-5 rounded-xl border border-primary-bg">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-primary-text">{resource.title}</h3>
        <CardIcon className="h-6 w-6 text-accent-yellow flex-shrink-0" />
      </div>

      <p className="text-sm text-primary-text/80 mb-2">Course Code: <span className="font-medium text-accent-yellow">{resource.courseCode}</span></p>
      <p className="text-primary-text text-sm mb-4 line-clamp-2">{resource.description}</p>
      
      <div className="flex justify-between items-center text-xs text-primary-text/70 pt-2 border-t border-primary-text/30">
        <span>Downloads: {resource.downloadCount}</span>
        <span>Votes: {resource.upvotes - resource.downvotes}</span>
      </div>
    </div>
  );
};

export default ResourceCard;
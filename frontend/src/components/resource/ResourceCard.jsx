import React from 'react';

const ResourceCard = ({ resource }) => {
  const getResourceTypeIcon = (type) => {
    switch(type) {
      case 'Past Paper': return '📝';
      case 'Lecture Note': return '📋';
      case 'Assignment': return '📄';
      default: return '📚';
    }
  };

  const getResourceTypeColor = (type) => {
    switch(type) {
      case 'Past Paper': return 'text-blue bg-blue';
      case 'Lecture Note': return 'text-green bg-green';
      case 'Assignment': return 'text-purple bg-purple';
      default: return 'text-orange bg-orange';
    }
  };

  const score = (resource.upvotes || 0) - (resource.downvotes || 0);
  const downloads = resource.downloadCount || 0;
  const type = resource.resourceType || resource.type || 'Resource';

  return (
    <div className="group bg-tertiary rounded-xl p-6 border border-light hover:border-blue transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getResourceTypeIcon(type)}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-opacity-20 ${getResourceTypeColor(type)}`}>
            {type}
          </span>
        </div>
        
        {score > 0 && (
          <div className="flex items-center gap-1 text-green text-sm">
            <span>👍</span>
            <span className="font-medium">+{score}</span>
          </div>
        )}
      </div>

      {/* Title and Course Code */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-primary mb-1 group-hover:text-blue transition-colors line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-blue text-sm font-medium">
          {resource.courseCode}
        </p>
      </div>

      {/* Description */}
      <p className="text-secondary text-sm mb-4 line-clamp-3">
        {resource.description || 'No description provided'}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>📥</span>
            <span>{downloads} downloads</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span>{resource.uploader?.username || 'Anonymous'}</span>
          </div>
        </div>
        
        <div className="text-muted">
          {new Date(resource.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button className="btn-primary text-sm flex-1">
          <span>📥</span>
          Download
        </button>
        <button className="btn-secondary text-sm px-4">
          <span>👁️</span>
          View
        </button>
        
        {/* Vote Buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button className="w-8 h-8 rounded-lg bg-secondary border border-light hover:bg-green hover:bg-opacity-20 hover:border-green transition-colors flex items-center justify-center text-xs">
            👍
          </button>
          <span className="text-xs text-muted min-w-[2rem] text-center">
            {score}
          </span>
          <button className="w-8 h-8 rounded-lg bg-secondary border border-light hover:bg-red hover:bg-opacity-20 hover:border-red transition-colors flex items-center justify-center text-xs">
            👎
          </button>
        </div>
      </div>

      {/* Progress indicator if downloading */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-blue rounded-full w-0 transition-all duration-300 group-hover:w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
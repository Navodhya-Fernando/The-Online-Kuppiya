import React from 'react';

const ResourceCard = ({ resource }) => {
  return (
    <div className="resource-card bg-white shadow-lg p-5 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-primary mb-2">{resource.title}</h3>
      <p className="text-sm text-gray-600 mb-3">Course Code: <span className="font-medium text-accent">{resource.courseCode}</span></p>
      <p className="text-gray-700 text-sm mb-4">{resource.description}</p>
      
      <div className="flex-row justify-between items-center text-xs text-gray-500">
        <span>Downloads: {resource.downloadCount}</span>
        <span>Votes: {resource.upvotes - resource.downvotes}</span>
      </div>

      <div className="mt-4 flex-row justify-end space-x-2">
        {/* Placeholder buttons for interaction */}
        <button className="btn btn-primary text-xs py-1 px-3">Download</button>
        <button className="btn text-xs py-1 px-3 bg-gray-200 text-gray-700">View</button>
      </div>
    </div>
  );
};

export default ResourceCard;
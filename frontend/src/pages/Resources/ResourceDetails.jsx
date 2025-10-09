import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchResourceById } from '../../api/resourceApi';
import useApi from '../../hooks/useApi';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const { data: resource, loading, error, execute: loadResource } = useApi(fetchResourceById);

  useEffect(() => {
    if (id) {
        loadResource(id);
    }
  }, [id, loadResource]);

  if (loading) return <div className="container text-center mt-10 text-primary-text">Loading resource details...</div>;
  if (error) return <div className="container text-red-400 mt-10">Error: Resource not found or connection failed.</div>;
  if (!resource) return <div className="container text-primary-text/70 mt-10">No resource data available.</div>;

  const handleDownload = () => {
      window.open(resource.fileUrl, '_blank');
  };

  const GUARANTEED_BG_STYLE = { backgroundColor: '#0A7075' };

  return (
    <div style={GUARANTEED_BG_STYLE} className="resource-details-page container max-w-4xl mx-auto p-8 shadow-xl rounded-lg mt-10 text-primary-text">
      <h1 className="text-4xl font-extrabold mb-3 text-primary-text">{resource.title}</h1>
      <div className="flex flex-wrap text-sm text-primary-text/80 mb-6 space-x-6">
        <p>Subject: <span className="font-semibold text-accent-yellow">{resource.courseCode}</span></p>
        <p>Type: <span className="font-semibold text-accent-yellow">{resource.resourceType || 'N/A'}</span></p>
        <p>Institute: <span className="font-semibold text-accent-yellow">{resource.institute || 'N/A'}</span></p>
      </div>

      <div className="border-t pt-6 border-primary-text/50">
        <h2 className="text-xl font-bold mb-3">Description</h2>
        <p className="text-primary-text leading-relaxed mb-6">{resource.description}</p>
      </div>
      
      {resource.status === 'pending' && (
          <div className="bg-accent-yellow/20 p-4 rounded-lg mb-6 text-accent-yellow font-bold text-center">
              <p>STATUS: PENDING APPROVAL by the moderators.</p>
          </div>
      )}

      <div className="flex justify-between items-center bg-primary-bg/80 p-4 rounded-lg mb-6">
        <div className="text-sm">
          <p>Uploader: <span className="font-medium text-accent-yellow">{resource.uploaderId?.username || 'System User'}</span></p>
          <p>Uploaded On: <span className="font-medium">{new Date(resource.createdAt).toLocaleDateString()}</span></p>
        </div>
        <div className="text-sm text-right">
          <p>Downloads: <span className="font-bold">{resource.downloadCount}</span></p>
          <p>Upvotes: <span className="font-bold text-accent-yellow">{resource.upvotes}</span></p>
        </div>
      </div>

      <button onClick={handleDownload} className="btn btn-primary w-full text-lg">
        Download Resource
      </button>
    </div>
  );
};

export default ResourceDetailsPage;
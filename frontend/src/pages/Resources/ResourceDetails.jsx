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

  if (loading) return <div className="container text-center mt-10">Loading resource details...</div>;
  if (error) return <div className="container text-red-600 mt-10">Error: Resource not found or connection failed.</div>;
  if (!resource) return <div className="container text-gray-500 mt-10">No resource data available.</div>;

  const handleDownload = () => {
      // In a real app, this would trigger an API call to track the download
      window.open(resource.fileUrl, '_blank');
  };

  return (
    <div className="resource-details-page container max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-4xl font-extrabold mb-3 text-primary">{resource.title}</h1>
      <p className="text-lg text-gray-600 mb-6">Course Code: <span className="font-semibold text-accent">{resource.courseCode}</span></p>
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed mb-6">{resource.description}</p>
      </div>

      <div className="flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
        <div className="text-sm">
          <p>Uploader: <span className="font-medium text-primary">{resource.uploaderId?.username || 'System User'}</span></p>
          <p>Uploaded On: <span className="font-medium">{new Date(resource.createdAt).toLocaleDateString()}</span></p>
        </div>
        <div className="text-sm text-right">
          <p>Downloads: <span className="font-bold">{resource.downloadCount}</span></p>
          <p>Upvotes: <span className="font-bold text-green-600">{resource.upvotes}</span></p>
        </div>
      </div>

      <button onClick={handleDownload} className="btn btn-primary w-full text-lg">
        Download Resource
      </button>
    </div>
  );
};

export default ResourceDetailsPage;
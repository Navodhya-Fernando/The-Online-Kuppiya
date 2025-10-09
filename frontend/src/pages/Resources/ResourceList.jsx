import React, { useEffect } from 'react';
import { fetchAllResources } from '../../api/resourceApi';
import useApi from '../../hooks/useApi';
import ResourceCard from '../../components/resource/ResourceCard';

const ResourceListPage = () => {
  const { data: resources, loading, error, execute: loadResources } = useApi(fetchAllResources);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  if (loading) return <div className="container mt-8 text-center">Loading resources...</div>;
  if (error) return <div className="container mt-8 text-red-600 font-semibold">Error: Failed to load resources. Is the backend running? ({error})</div>;

  return (
    <div className="resource-list-page container">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Resources</h1>
      
      <div className="resource-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources && resources.length > 0 ? (
          resources.map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No resources found. Be the first to upload one!</p>
        )}
      </div>
    </div>
  );
};

export default ResourceListPage;
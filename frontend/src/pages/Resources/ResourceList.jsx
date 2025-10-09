import React, { useEffect, useState } from 'react';
import { fetchAllResources } from '../../api/resourceApi';
import useApi from '../../hooks/useApi';
import ResourceCard from '../../components/resource/ResourceCard';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ResourceListPage = () => {
  const { data: resources, loading, error, execute: loadResources } = useApi(fetchAllResources);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('top_rated');
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceType, setResourceType] = useState('All');

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleCardClick = (resourceId) => {
      if (!user) {
          navigate('/login', { state: { from: `/resource/${resourceId}` } });
      } else {
          navigate(`/resource/${resourceId}`);
      }
  };

  const sortResources = (list) => {
    if (!list) return [];
    
    const mutableList = list.map(r => ({
      ...r,
      score: r.upvotes - r.downvotes,
      date: new Date(r.createdAt),
      popularity: r.downloadCount + r.upvotes,
      type: r.resourceType || 'Lecture Note',
    }));

    let sorted = mutableList;

    switch (filter) {
      case 'most_recent':
        sorted = sorted.sort((a, b) => b.date - a.date);
        break;
      case 'most_popular':
        sorted = sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'top_rated':
      default:
        sorted = sorted.sort((a, b) => b.score - a.score);
        break;
    }
    return sorted;
  };

  const filteredResources = sortResources(resources)?.filter(resource => {
    const termMatch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     resource.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = resourceType === 'All' || resource.type === resourceType;

    return termMatch && typeMatch;
  });

  const filterOptions = [
    { value: 'top_rated', label: '⭐ Top Rated', icon: '⭐' },
    { value: 'most_recent', label: '🕐 Most Recent', icon: '🕐' },
    { value: 'most_popular', label: '🔥 Most Popular', icon: '🔥' },
  ];

  const resourceTypes = [
    { value: 'All', label: 'All Types', icon: '📚' },
    { value: 'Past Paper', label: 'Past Paper', icon: '📝' },
    { value: 'Lecture Note', label: 'Lecture Note', icon: '📋' },
    { value: 'Assignment', label: 'Assignment', icon: '📄' }
  ];

  const getResourceStats = () => {
    if (!resources) return { total: 0, pastPapers: 0, notes: 0, assignments: 0 };
    
    return {
      total: resources.length,
      pastPapers: resources.filter(r => r.type === 'Past Paper').length,
      notes: resources.filter(r => r.type === 'Lecture Note').length,
      assignments: resources.filter(r => r.type === 'Assignment').length,
    };
  };

  const stats = getResourceStats();

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-2xl mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Academic Resources</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Access quality study materials shared by students, for students
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-secondary rounded-xl p-4 border border-light text-center">
            <div className="text-2xl font-bold text-blue">{stats.total}</div>
            <div className="text-xs text-muted">Total Resources</div>
          </div>
          <div className="bg-secondary rounded-xl p-4 border border-light text-center">
            <div className="text-2xl font-bold text-green">{stats.pastPapers}</div>
            <div className="text-xs text-muted">Past Papers</div>
          </div>
          <div className="bg-secondary rounded-xl p-4 border border-light text-center">
            <div className="text-2xl font-bold text-purple">{stats.notes}</div>
            <div className="text-xs text-muted">Lecture Notes</div>
          </div>
          <div className="bg-secondary rounded-xl p-4 border border-light text-center">
            <div className="text-2xl font-bold text-orange">{stats.assignments}</div>
            <div className="text-xs text-muted">Assignments</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-secondary rounded-xl p-6 mb-8 border border-light">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted">🔍</span>
              </div>
              <input 
                type="text"
                placeholder="Search by title, description, or course code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10 w-full"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="input-primary pr-10 appearance-none cursor-pointer"
              >
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-muted">▼</span>
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="relative">
              <select 
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="input-primary pr-10 appearance-none cursor-pointer"
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-muted">▼</span>
              </div>
            </div>

            {/* Upload Button */}
            {user && (
              <Link to="/resources/upload" className="btn-primary whitespace-nowrap">
                <span>📤</span>
                Upload Resource
              </Link>
            )}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="bg-secondary rounded-xl p-6 border border-light mb-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-tertiary rounded-xl mb-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue border-t-transparent rounded-full"></div>
              </div>
              <p className="text-secondary">Loading resources...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red bg-opacity-20 rounded-xl mb-4">
                <span className="text-red text-xl">⚠️</span>
              </div>
              <p className="text-red font-semibold">Failed to load resources</p>
              <button onClick={loadResources} className="btn-secondary mt-4">
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {filteredResources && filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map(resource => (
                    <div key={resource._id} onClick={() => handleCardClick(resource._id)} className="cursor-pointer">
                      <ResourceCard resource={resource} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-xl mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No resources found</h3>
                  <p className="text-secondary mb-6">Try adjusting your search terms or filters</p>
                  {user && (
                    <Link to="/resources/upload" className="btn-primary">
                      <span>📤</span>
                      Be the first to upload
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      
        {/* Activity Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Activity */}
          <div className="bg-secondary rounded-xl p-6 border border-light">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Recent Activity</h2>
              <span className="text-2xl">📊</span>
            </div>
            
            {!user ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-blue bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue text-xl">👤</span>
                </div>
                <p className="text-secondary mb-4">Login to see your activity</p>
                <Link to="/login" className="btn-outline">
                  Login Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-tertiary rounded-lg">
                  <span className="text-green">📤</span>
                  <div className="flex-1">
                    <p className="text-primary text-sm">Uploaded 'ADDS242F Final'</p>
                    <p className="text-muted text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-tertiary rounded-lg">
                  <span className="text-blue">👍</span>
                  <div className="flex-1">
                    <p className="text-primary text-sm">Voted on 'MongoDB Query Guide'</p>
                    <p className="text-muted text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-tertiary rounded-lg">
                  <span className="text-purple">📥</span>
                  <div className="flex-1">
                    <p className="text-primary text-sm">Downloaded 'Project Proposal Template'</p>
                    <p className="text-muted text-xs">3 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary rounded-xl p-6 border border-light">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
              <span className="text-2xl">⚡</span>
            </div>
            
            <div className="space-y-3">
              {user ? (
                <>
                  <Link to="/resources/upload" className="flex items-center gap-3 p-4 bg-tertiary rounded-lg hover:bg-hover transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">📤</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary group-hover:text-blue">Upload Resource</h3>
                      <p className="text-secondary text-sm">Share your study materials</p>
                    </div>
                    <span className="text-muted group-hover:text-blue">→</span>
                  </Link>
                  
                  <Link to="/forum/ask" className="flex items-center gap-3 p-4 bg-tertiary rounded-lg hover:bg-hover transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">❓</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary group-hover:text-blue">Ask Question</h3>
                      <p className="text-secondary text-sm">Get help from community</p>
                    </div>
                    <span className="text-muted group-hover:text-blue">→</span>
                  </Link>
                  
                  <Link to="/leaderboard" className="flex items-center gap-3 p-4 bg-tertiary rounded-lg hover:bg-hover transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary group-hover:text-blue">View Rankings</h3>
                      <p className="text-secondary text-sm">See top contributors</p>
                    </div>
                    <span className="text-muted group-hover:text-blue">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-3 p-4 bg-blue bg-opacity-20 border border-blue rounded-lg hover:bg-opacity-30 transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue">Login</h3>
                      <p className="text-blue text-sm opacity-80">Access all features</p>
                    </div>
                    <span className="text-blue">→</span>
                  </Link>
                  
                  <Link to="/register" className="flex items-center gap-3 p-4 bg-tertiary rounded-lg hover:bg-hover transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary group-hover:text-blue">Join Community</h3>
                      <p className="text-secondary text-sm">Create your account</p>
                    </div>
                    <span className="text-muted group-hover:text-blue">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceListPage;
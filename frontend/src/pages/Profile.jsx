import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    navigate('/login');
    return null;
  }

  const DEFAULT_PROFILE_PIC = `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=ffffff&size=128`;

  const profileData = {
    institute: 'National Innovation Centre - NIBM',
    position: 'Advanced Diploma Undergraduate',
    email: user.email,
    phone: user.phone || '+94 77 123 4567',
    documentsAccessed: 42,
    questionsAsked: user.uploadCount || 0,
    questionsAnswered: 15,
    joinDate: new Date(user.createdAt || Date.now()).toLocaleDateString(),
  };

  const badges = [
    { name: 'First Upload', icon: '🎯', earned: true },
    { name: 'Helper', icon: '🤝', earned: true },
    { name: 'Scholar', icon: '🎓', earned: false },
    { name: 'Top Contributor', icon: '🏆', earned: false },
  ];

  const recentActivity = [
    { type: 'upload', description: 'Uploaded "Data Structures Notes"', date: '2 days ago' },
    { type: 'question', description: 'Asked about Python Libraries', date: '1 week ago' },
    { type: 'answer', description: 'Answered question on Machine Learning', date: '2 weeks ago' },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'upload': return '📤';
      case 'question': return '❓';
      case 'answer': return '💡';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <div className="bg-secondary rounded-xl p-8 mb-8 border border-light">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative">
                <img 
                  src={DEFAULT_PROFILE_PIC} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl border-4 border-blue shadow-lg" 
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green rounded-full border-4 border-secondary flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-primary">{user.username}</h1>
                <p className="text-secondary text-lg">{profileData.position}</p>
                <p className="text-muted text-sm mt-1">{profileData.institute}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-tertiary rounded-xl p-4 text-center border border-light">
                <div className="text-2xl font-bold text-blue">{user.credits || 0}</div>
                <div className="text-xs text-muted">Total Points</div>
              </div>
              
              <div className="bg-tertiary rounded-xl p-4 text-center border border-light">
                <div className="text-2xl font-bold text-green">{user.uploadCount || 0}</div>
                <div className="text-xs text-muted">Resources</div>
              </div>
              
              <div className="bg-tertiary rounded-xl p-4 text-center border border-light">
                <div className="text-2xl font-bold text-purple">{profileData.questionsAnswered}</div>
                <div className="text-xs text-muted">Answers</div>
              </div>
              
              <div className="bg-tertiary rounded-xl p-4 text-center border border-light">
                <div className="text-2xl font-bold text-orange">{profileData.documentsAccessed}</div>
                <div className="text-xs text-muted">Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-secondary rounded-xl p-2 border border-light">
          {['overview', 'activity', 'badges', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab 
                  ? 'bg-blue text-white' 
                  : 'text-secondary hover:text-primary hover:bg-tertiary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="bg-secondary rounded-xl p-6 border border-light">
                  <h2 className="text-xl font-semibold text-primary mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-light">
                      <span className="text-muted">Email</span>
                      <span className="text-primary font-medium">{profileData.email}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-light">
                      <span className="text-muted">Phone</span>
                      <span className="text-primary font-medium">{profileData.phone}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-light">
                      <span className="text-muted">Institute</span>
                      <span className="text-primary font-medium">{profileData.institute}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted">Member Since</span>
                      <span className="text-primary font-medium">{profileData.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-secondary rounded-xl p-6 border border-light">
                  <h2 className="text-xl font-semibold text-primary mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate('/resources/upload')}
                      className="btn-primary text-left"
                    >
                      <span className="text-2xl mb-2 block">📤</span>
                      <div className="font-semibold">Upload Resource</div>
                      <div className="text-sm opacity-80">Share your knowledge</div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/forum/ask')}
                      className="btn-secondary text-left"
                    >
                      <span className="text-2xl mb-2 block">❓</span>
                      <div className="font-semibold">Ask Question</div>
                      <div className="text-sm opacity-80">Get help from community</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-secondary rounded-xl p-6 border border-light">
                <h2 className="text-xl font-semibold text-primary mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-tertiary rounded-lg border border-light">
                      <div className="w-10 h-10 bg-hover rounded-lg flex items-center justify-center text-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-primary font-medium">{activity.description}</p>
                        <p className="text-muted text-sm">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="bg-secondary rounded-xl p-6 border border-light">
                <h2 className="text-xl font-semibold text-primary mb-6">Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${badge.earned ? 'bg-blue bg-opacity-10 border-blue' : 'bg-tertiary border-light'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${badge.earned ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                          {badge.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${badge.earned ? 'text-blue' : 'text-muted'}`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {badge.earned ? 'Earned' : 'Not earned yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-secondary rounded-xl p-6 border border-light">
                <h2 className="text-xl font-semibold text-primary mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <button className="w-full btn-secondary justify-start">
                    <span>✏️</span>
                    Edit Profile
                  </button>
                  <button className="w-full btn-secondary justify-start">
                    <span>🔒</span>
                    Change Password
                  </button>
                  <button className="w-full btn-secondary justify-start">
                    <span>🔔</span>
                    Notification Settings
                  </button>
                  <button className="w-full btn-secondary justify-start">
                    <span>🌙</span>
                    Theme Preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Rank */}
            <div className="bg-secondary rounded-xl p-6 border border-light text-center">
              <h3 className="text-lg font-semibold text-primary mb-4">Your Rank</h3>
              <div className="w-20 h-20 bg-blue bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue text-2xl font-bold">#12</span>
              </div>
              <p className="text-secondary text-sm">
                You're in the top 25% of contributors!
              </p>
            </div>

            {/* Logout Button */}
            <div className="bg-secondary rounded-xl p-6 border border-light">
              <button 
                onClick={logout} 
                className="w-full btn-danger"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
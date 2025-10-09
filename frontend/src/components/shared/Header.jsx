// frontend/src/components/shared/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Logo from '../../assets/Logo.png'; 

// Minimal Icons 
const MenuIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>);
const CloseIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>);
const HomeIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>);
const ResourceIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>);
const QandAIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M15 4v7h-2V4h-2v7H9V4H7v7H5V4H3v9h2c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4V4zM7 19h10v2H7z" /></svg>);
const LeaderboardIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14H8v-2h3v2zm0-4H8V9h3v2zm6 4h-3v-2h3v2zm0-4h-3V9h3v2z" /></svg>);
const LoginIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 9v-8h-2v8h2z" /></svg>);
const ProfileIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>);
const AdminIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 9l-5 4.87 1.18 6.88L12 17.77l-6.18 2.98L7 14.87 2 10l6.91-1.74L12 1zm0 4.5L10.18 9l-3.09.8 2.23 2.18-.53 3.07L12 13.85l3.21 1.2-.53-3.07L16.91 9.8 13.82 9 12 5.5z"/></svg>);
const SunIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-4c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V4c0-.55.45-1 1-1zm0 16c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zM5.64 6.96c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L6.3 9.71c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l.75-.75zm11.31 11.31c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l.75-.75c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-.75.75zM4 12c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1zm16 0c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1zm-2.04 5.04c-.39-.39-.39-1.02 0-1.41l.75-.75c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-.75.75c-.39.39-1.02.39-1.41 0zM6.96 5.64c-.39.39-.39 1.02 0 1.41l.75.75c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.75-.75c-.39-.39-1.02-.39-1.41 0z"/></svg>);
const MoonIcon = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10 2c-.44 0-.87.05-1.3.15C4.38 3.5 2 7.7 2 12c0 5.52 4.48 10 10 10 4.3 0 8.5-2.38 9.85-6.7a.997.997 0 00-.09-.58c-.01-.03-.02-.07-.03-.1c-.02-.06-.06-.11-.11-.16a.997.997 0 00-.73-.39h-.1c-1.2 0-2.4-.23-3.53-.7a1 1 0 00-.63-.12c-.52.05-1.03.11-1.55.17-5.11.59-9.52-3.8-9-8.91C3.3 2.94 4.54 2 6 2h4zm0 2h-.14c.4.07.82.13 1.25.17.47.05.95.07 1.43.07 4.14 0 7.5 3.36 7.5 7.5 0 4.14-3.36 7.5-7.5 7.5-4.14 0-7.5-3.36-7.5-7.5 0-3.37 2.21-6.19 5.25-7.24V4z"/></svg>);

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useSettings();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const baseNavItems = [
    { to: "/", text: "Home", icon: HomeIcon },
    { to: "/resources", text: "Resources", icon: ResourceIcon },
    { to: "/forum", text: "Q&A Forum", icon: QandAIcon },
    { to: "/leaderboard", text: "Leaderboard", icon: LeaderboardIcon },
  ];

  // Add admin link for admin/moderator users
  const navItems = isAuthenticated && user && (user.role === 'admin' || user.role === 'moderator') 
    ? [...baseNavItems, { to: "/admin", text: "Admin Panel", icon: AdminIcon }]
    : baseNavItems;

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path || (path === '/resources' && location.pathname === '/');
    const baseClass = `
      relative px-4 py-2 mx-1 text-sm font-semibold rounded-md
      transition-all duration-200 ease-in-out
      flex items-center gap-2
      hover:bg-tertiary hover:text-blue
      focus:outline-none focus:ring-2 focus:ring-blue focus:ring-opacity-50
    `;
    const activeClass = `
      bg-tertiary text-blue shadow-md
      before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 
      before:h-0.5 before:bg-blue before:rounded-full
    `;
    const inactiveClass = `
      text-secondary hover:text-primary
    `;
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`.trim().replace(/\s+/g, ' ');
  };

  const DEFAULT_PROFILE_PIC = "https://ui-avatars.com/api/?name=User&background=3B82F6&color=ffffff&size=128";

  return (
    <header 
      className="sticky top-0 z-50 border-b shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottomColor: 'var(--border-light)',
        boxShadow: 'var(--shadow-xl)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo and Site Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <span 
                className="text-xl font-bold"
                style={{ color: 'var(--accent-blue)' }}
              >
                K
              </span>
            </div>
            <Link 
              to="/" 
              className="text-xl font-bold transition-colors"
              style={{ 
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
            >
              The Online Kuppiya
            </Link>
          </div>
          
          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center bg-opacity-50 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              {navItems.map(item => (
                <Link key={item.to} to={item.to} className={getNavLinkClass(item.to)}>
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.text}</span>
                  <span className="xl:hidden">{item.text.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side: Auth/Profile and Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications (if logged in) */}
            {isAuthenticated && (
              <button 
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </button>
            )}

            {/* Auth/Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div 
                    className="text-xs capitalize"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.role}
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="p-1 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <img 
                    src={DEFAULT_PROFILE_PIC.replace('User', user?.username || 'User')}
                    alt="Profile" 
                    className="h-8 w-8 rounded-lg object-cover" 
                  />
                </Link>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--accent-blue)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-blue-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-blue)'}
              >
                <LoginIcon className="h-4 w-4" />
                Login
              </Link>
            )}
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
              title="Toggle theme"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
            >
              {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className="lg:hidden absolute w-full top-16 left-0 z-50 border-t shadow-xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderTopColor: 'var(--border-light)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-1">
              {navItems.map(item => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <item.icon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  {item.text}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div 
                className="mt-4 pt-4 border-t"
                style={{ borderTopColor: 'var(--border-light)' }}
              >
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      style={{ 
                        color: 'var(--text-primary)',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <ProfileIcon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                      Profile
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left"
                      style={{ 
                        color: 'var(--accent-red)',
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LoginIcon className="h-5 w-5 transform rotate-180" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: 'var(--accent-blue)',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <LoginIcon className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
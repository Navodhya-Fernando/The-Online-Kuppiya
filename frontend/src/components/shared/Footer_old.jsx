import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const contributorLinks = [
    { name: 'Navodhya Fernando', linkedin: 'https://www.linkedin.com/in/navodhya-fernando-' },
    { name: 'Sandrea Raj', linkedin: 'https://www.linkedin.com/in/sandrea-raj-a32552329' },
    { name: 'Hashini Handapangoda', linkedin: 'https://www.linkedin.com/in/hashini-handapangoda-135290294' },
  ];

  const LinkedInIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.314-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );

  return (
    <footer className="bg-secondary border-t border-light mt-auto">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-tertiary rounded-xl flex items-center justify-center">
                <span className="text-blue text-2xl font-bold">K</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">The Online Kuppiya</h3>
                <p className="text-secondary text-sm">Your Academic Resource Hub</p>
              </div>
            </div>
            <p className="text-secondary max-w-md">
              Connecting students with quality educational resources, fostering collaborative learning, 
              and building a stronger academic community.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-tertiary hover:bg-hover transition-colors">
                <LinkedInIcon className="h-5 w-5 text-secondary hover:text-blue" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-tertiary hover:bg-hover transition-colors">
                <svg className="h-5 w-5 text-secondary hover:text-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-tertiary hover:bg-hover transition-colors">
                <svg className="h-5 w-5 text-secondary hover:text-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.141.889 2.739a.36.36 0 01.083.343c-.091.378-.293 1.215-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.744-1.378l-.628 2.43c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017 0z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-secondary hover:text-blue transition-colors">Home</Link>
              <Link to="/resources" className="text-secondary hover:text-blue transition-colors">Resources</Link>
              <Link to="/forum" className="text-secondary hover:text-blue transition-colors">Q&A Forum</Link>
              <Link to="/leaderboard" className="text-secondary hover:text-blue transition-colors">Leaderboard</Link>
            </nav>
          </div>
          
          {/* The Team */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">The Team</h4>
            <div className="space-y-3">
              {contributorLinks.map(contributor => (
                <div key={contributor.name} className="flex items-center gap-2">
                  <span className="text-secondary text-sm">{contributor.name}</span>
                  <a 
                    href={contributor.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-blue transition-colors"
              >
                <LinkedInIcon className="h-5 w-5 fill-current" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
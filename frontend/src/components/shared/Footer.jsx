import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const teamMembers = [
    { name: 'Navodhya Fernando', linkedin: 'https://www.linkedin.com/in/navodhya-fernando-' },
    { name: 'Sandrea Raj', linkedin: 'https://www.linkedin.com/in/sandrea-raj-a32552329' },
    { name: 'Hashini Handapangoda', linkedin: 'https://www.linkedin.com/in/hashini-handapangoda-135290294' },
  ];

  const quickLinks = [
    { name: 'Q&A Forum', path: '/forum' },
    { name: 'Ask Question', path: '/ask' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const LinkedInIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.314-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );

  return (
    <footer className="footer-minimal">
      <div className="container">
        <div className="footer-section">
          <div className="logo-container">
            <img 
              src={`${import.meta.env.BASE_URL}Logo.png`}
              alt="The Online Kuppiya Logo"
            />
          </div>
          <p>
            Advanced Diploma in Data Science,<br />
            National Innovation Centre - NIBM,<br />
            Colombo -05, Sri Lanka
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-section">
          <h3>Development Team</h3>
          <ul className="team-links">
            {teamMembers.map((member, index) => (
              <li key={index}>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon />
                  <span>{member.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} The Online Kuppiya. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

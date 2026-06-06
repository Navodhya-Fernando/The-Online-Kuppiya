import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-card">
          <div className="not-found-hero">
            <div className="not-found-mark">404</div>
            <h1>Page not found</h1>
            <p>
              The page you asked for has drifted off the study path. Head back to the forum,
              or return home and keep moving.
            </p>
          </div>

          <div className="not-found-actions">
            <Link to="/" className="btn-minimal btn-minimal-primary">
              Go to homepage
            </Link>
            <Link to="/forum" className="btn-minimal">
              Browse questions
            </Link>
            <button onClick={() => window.history.back()} className="btn-minimal not-found-back">
              Go back
            </button>
          </div>

          <div className="not-found-grid">
            <Link to="/forum" className="not-found-link-card">
              <span>Q&A Forum</span>
              <p>Search active discussions and answers.</p>
            </Link>
            <Link to="/leaderboard" className="not-found-link-card">
              <span>Leaderboard</span>
              <p>See who is helping the community most.</p>
            </Link>
            <Link to="/ask" className="not-found-link-card">
              <span>Ask a question</span>
              <p>Start a new thread for your topic.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
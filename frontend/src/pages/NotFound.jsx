import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-light">
              <span className="text-6xl">🔍</span>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-6 mb-12">
            <h1 className="text-8xl font-bold text-blue mb-4">404</h1>
            <h2 className="text-3xl font-bold text-primary mb-4">Oops! Page Not Found</h2>
            <p className="text-lg text-secondary max-w-md mx-auto">
              The page you're looking for seems to have gone on a study break. 
              Don't worry, we'll help you get back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-primary">
                <span>🏠</span>
                Go to Homepage
              </Link>
              <Link to="/resources" className="btn-secondary">
                <span>📚</span>
                Browse Resources
              </Link>
            </div>
            
            <button 
              onClick={() => window.history.back()} 
              className="text-blue hover:text-hover transition-colors text-sm"
            >
              ← Go back to previous page
            </button>
          </div>

          {/* Popular Links */}
          <div className="mt-16 pt-8 border-t border-light">
            <h3 className="text-lg font-semibold text-primary mb-6">Popular Destinations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link to="/resources" className="group bg-secondary rounded-xl p-4 border border-light hover:border-blue transition-colors">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-semibold text-primary group-hover:text-blue">Resources</h4>
                <p className="text-secondary text-sm">Study materials & notes</p>
              </Link>
              
              <Link to="/forum" className="group bg-secondary rounded-xl p-4 border border-light hover:border-blue transition-colors">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-primary group-hover:text-blue">Q&A Forum</h4>
                <p className="text-secondary text-sm">Ask & answer questions</p>
              </Link>
              
              <Link to="/leaderboard" className="group bg-secondary rounded-xl p-4 border border-light hover:border-blue transition-colors">
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold text-primary group-hover:text-blue">Leaderboard</h4>
                <p className="text-secondary text-sm">Top contributors</p>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-12 p-6 bg-secondary rounded-xl border border-light">
            <h3 className="text-lg font-semibold text-primary mb-2">Still can't find what you're looking for?</h3>
            <p className="text-secondary text-sm mb-4">Our team is here to help you navigate your academic journey</p>
            <Link to="/contact" className="btn-outline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
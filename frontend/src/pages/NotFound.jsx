import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page container text-center my-20">
      <h1 className="text-6xl font-extrabold text-red-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        The resource you requested could not be found. It may have been moved or deleted.
      </p>
      <Link to="/" className="btn btn-primary text-lg">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
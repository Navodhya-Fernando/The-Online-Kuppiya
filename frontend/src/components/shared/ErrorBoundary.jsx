// frontend/src/components/shared/ErrorBoundary.jsx

import * as Sentry from '@sentry/react';

const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Oops! Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've been notified about this error and will look into it.
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-red-800">
                Error Details
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'An unexpected error occurred'}</p>
              </div>
            </div>
            <div>
              <button
                onClick={resetError}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
            <div>
              <button
                onClick={() => window.location.href = '/'}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setLevel('error');
    }
  }
);

export default ErrorBoundary;

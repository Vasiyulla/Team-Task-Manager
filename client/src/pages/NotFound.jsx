import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <Link to="/dashboard">
          <Button variant="primary">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

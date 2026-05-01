import React from 'react';

const SkeletonLoader = ({ count = 1, type = 'card', className = '' }) => {
  const renders = Array.from({ length: count });

  if (type === 'card') {
    return renders.map((_, i) => (
      <div key={i} className={`skeleton h-32 rounded-lg ${className}`} />
    ));
  }

  if (type === 'text') {
    return renders.map((_, i) => (
      <div key={i} className={`skeleton h-4 rounded mb-2 ${className}`} />
    ));
  }

  if (type === 'task') {
    return renders.map((_, i) => (
      <div key={i} className={`skeleton h-20 rounded-lg ${className}`} />
    ));
  }

  if (type === 'user') {
    return renders.map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-4 rounded mb-2 w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      </div>
    ));
  }

  return null;
};

export default SkeletonLoader;

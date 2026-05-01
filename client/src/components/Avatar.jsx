import React from 'react';

const colorOptions = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
];

const Avatar = ({ 
  name = '?', 
  src = null, 
  size = 'md', 
  className = '',
  colorIndex = 0,
  ...props 
}) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const bgColor = colorOptions[colorIndex % colorOptions.length];
  const style = src ? {} : { backgroundColor: bgColor };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      style={style}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
};

export default Avatar;

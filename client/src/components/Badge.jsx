import React from 'react';

const priorityColors = {
  low: 'badge bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  medium: 'badge bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  high: 'badge bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  critical: 'badge bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
};

const statusColors = {
  todo: 'badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  'in-progress': 'badge bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  done: 'badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  overdue: 'badge bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
};

const Badge = ({ children, variant = 'default', type = 'default', className = '', ...props }) => {
  let classes = 'badge';

  if (type === 'priority') {
    classes = priorityColors[variant] || priorityColors.low;
  } else if (type === 'status') {
    classes = statusColors[variant] || statusColors.todo;
  } else if (variant === 'primary') {
    classes = 'badge-primary';
  } else if (variant === 'success') {
    classes = 'badge-success';
  } else if (variant === 'warning') {
    classes = 'badge-warning';
  } else if (variant === 'danger') {
    classes = 'badge-danger';
  }

  return (
    <span className={`${classes} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;

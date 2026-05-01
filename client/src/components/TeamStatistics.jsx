import React, { useEffect, useState } from 'react';
import { getTeamStatistics } from '../api/teamClient';
import SkeletonLoader from './SkeletonLoader';

const TeamStatistics = ({ teamId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [teamId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getTeamStatistics(teamId);
      setStats(response.data);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: '📋',
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: '✅',
      color: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks,
      icon: '⚙️',
      color: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks,
      icon: '⏰',
      color: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Statistics</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`${item.color} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Completion Progress */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Completion Rate
          </span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {stats.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Member Workload */}
      {Object.keys(stats.memberWorkload || {}).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Member Workload</h4>
          <div className="space-y-2">
            {Object.values(stats.memberWorkload).map((member, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1 sm:gap-4 py-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{member.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400 min-w-[40px] text-xs">
                    {member.completed}/{member.assigned}
                  </span>
                  <div className="flex-1 sm:w-24 bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{
                        width: `${member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatistics;

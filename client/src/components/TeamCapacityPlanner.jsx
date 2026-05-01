import React, { useEffect, useState } from 'react';
import { getTeamCapacity } from '../api/teamClient';
import SkeletonLoader from './SkeletonLoader';
import Avatar from './Avatar';

const TeamCapacityPlanner = ({ teamId }) => {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCapacity();
  }, [teamId]);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      const response = await getTeamCapacity(teamId);
      setCapacity(response.data);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load capacity data');
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

  if (!capacity) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'overloaded':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-300';
      case 'underutilized':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-300';
      case 'balanced':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overloaded':
        return '⚠️';
      case 'underutilized':
        return '📍';
      case 'balanced':
        return '✅';
      default:
        return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Capacity */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Overall Team Capacity
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Current Workload</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {capacity.currentLoad}/{capacity.maxCapacity}
            </span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                capacity.utilizationPercentage > 80
                  ? 'bg-red-500'
                  : capacity.utilizationPercentage > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${capacity.utilizationPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Utilization</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {capacity.utilizationPercentage}%
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className={`mt-4 p-3 rounded-lg ${
          capacity.utilizationPercentage > 80
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : capacity.utilizationPercentage > 60
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        }`}>
          {capacity.utilizationPercentage > 80
            ? '⚠️ Team is at high capacity. Consider redistributing tasks.'
            : capacity.utilizationPercentage > 60
            ? '📊 Team capacity is good. Monitor for overload.'
            : '✅ Team has comfortable workload distribution.'}
        </div>
      </div>

      {/* Team Size & Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{capacity.teamSize}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Max Capacity</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{capacity.maxCapacity}</div>
        </div>
      </div>

      {/* Member Capacity Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          👥 Individual Member Capacity
        </h3>
        <div className="space-y-3">
          {capacity.memberCapacity.map((member, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${getStatusColor(member.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name={member.name} size="sm" src={member.avatar} />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs opacity-75">
                      {member.currentTasks}/{member.capacity} tasks
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {member.utilizationPercentage}%
                </span>
              </div>
              <div className="w-full bg-black/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-current opacity-60"
                  style={{ width: `${member.utilizationPercentage}%` }}
                />
              </div>
              <p className="text-xs mt-2 opacity-75">
                {member.status === 'overloaded'
                  ? 'Recommend reassigning tasks'
                  : member.status === 'underutilized'
                  ? 'Can take more assignments'
                  : 'Optimal workload'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {capacity.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Smart Recommendations
          </h3>
          <div className="space-y-2">
            {capacity.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  rec.type === 'overload'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <p className={`text-sm ${
                  rec.type === 'overload'
                    ? 'text-red-900 dark:text-red-300'
                    : 'text-blue-900 dark:text-blue-300'
                }`}>
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCapacityPlanner;

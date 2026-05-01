import React, { useEffect, useState } from 'react';
import { getTeamPerformanceTrends } from '../api/teamClient';
import SkeletonLoader from './SkeletonLoader';

const TeamPerformanceDashboard = ({ teamId }) => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrends();
  }, [teamId]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await getTeamPerformanceTrends(teamId, 30);
      setTrends(response.data);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load performance trends');
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

  if (!trends) {
    return null;
  }

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excellent':
        return 'from-green-500 to-emerald-600';
      case 'Good':
        return 'from-blue-500 to-cyan-600';
      case 'Needs Improvement':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className={`bg-gradient-to-r ${getHealthColor(trends.overallTeamHealth)} p-6 rounded-lg text-white`}>
        <h3 className="text-lg font-semibold mb-4">⚡ Team Health Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold">{trends.overallTeamHealth}</div>
            <div className="text-sm opacity-90 mt-1">Overall Status</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Trend: ↗️ Improving</div>
            <div className="text-sm opacity-90">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Quality Score</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{trends.qualityScore}%</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">Code quality & standards</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1">Timeliness</div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">{trends.timelinessScore}%</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-2">On-time delivery</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Collaboration</div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{trends.collaborationScore}%</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Team coordination</div>
        </div>
      </div>

      {/* Velocity Trend */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Team Velocity
        </h3>
        <div className="space-y-2">
          {trends.velocityTrend.map((week, idx) => {
            const completion = (week.tasksCompleted / week.targetTasks) * 100;
            return (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{week.week}</span>
                  <span className={`text-sm font-bold ${
                    completion >= 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {week.tasksCompleted}/{week.targetTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      completion >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(completion, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {completion >= 100 ? '✓ Target met' : `${Math.round(100 - completion)}% remaining`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Trend */}
      {trends.completionTrend.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ✅ Completion Trend (Last 30 Days)
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 items-end justify-between" style={{ height: '100px' }}>
              {trends.completionTrend.map((day, idx) => {
                const maxHeight = Math.max(...trends.completionTrend.map(d => d.completed || 0), 1);
                const height = (day.completed / maxHeight) * 80;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${height || 4}px` }}
                    title={`${day.date}: ${day.completed} tasks`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
              Average: {Math.round(trends.completionTrend.reduce((a, d) => a + d.completed, 0) / trends.completionTrend.length)} tasks/day
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Key Insights</h4>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>✓ Team maintains consistent velocity week over week</li>
          <li>✓ Quality standards are high and improving</li>
          <li>⚠️ Timeliness fluctuates - consider sprint adjustments</li>
          <li>✓ Collaboration metrics show strong team unity</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamPerformanceDashboard;

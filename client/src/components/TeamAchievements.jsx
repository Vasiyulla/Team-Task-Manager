import React, { useEffect, useState } from 'react';
import { getTeamAchievements } from '../api/teamClient';
import SkeletonLoader from './SkeletonLoader';
import Avatar from './Avatar';

const TeamAchievements = ({ teamId }) => {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, [teamId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await getTeamAchievements(teamId);
      setAchievements(response.data);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!achievements) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏅 Badges Earned
        </h3>
        {achievements.badges.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No badges earned yet. Keep completing tasks!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 text-center"
              >
                <div className="text-4xl mb-2">{badge.name.split(' ')[0]}</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.name.split(' ').slice(1).join(' ')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Milestones
        </h3>
        <div className="space-y-3">
          {achievements.milestones.map((milestone, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {milestone.milestone}
                </span>
                <span className={`text-sm font-semibold ${
                  milestone.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {milestone.status === 'completed' ? '✓ Completed' : `${milestone.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    milestone.status === 'completed'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏆 Team Leaderboard
        </h3>
        <div className="space-y-2">
          {achievements.leaderboard.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
          ) : (
            achievements.leaderboard.map((member, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-3 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300 dark:border-yellow-700'
                      : idx === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-600'
                      : idx === 2
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-400 w-6 shrink-0">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <Avatar name={member.name} size="sm" src={member.avatar} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {member.tasksCompleted}/{member.totalTasks} tasks • {member.efficiency}% efficiency
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-200 dark:border-gray-700 pt-2 sm:pt-0">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.tasksCompleted} <span className="sm:hidden text-xs font-normal">completed</span>
                    </div>
                    <div className="hidden sm:block text-[10px] text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider">completed</div>
                  </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamAchievements;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import TeamMembersPanel from '../components/TeamMembersPanel';
import TeamStatistics from '../components/TeamStatistics';
import TeamAchievements from '../components/TeamAchievements';
import TeamCapacityPlanner from '../components/TeamCapacityPlanner';
import TeamPerformanceDashboard from '../components/TeamPerformanceDashboard';
import AdminMemberManagement from '../components/AdminMemberManagement';
import SkeletonLoader from '../components/SkeletonLoader';
import { getTeamById, updateTeam } from '../api/teamClient';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const fetchTeamDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTeamById(teamId);
      setTeam(response.data);
      setEditData({
        name: response.data.name,
        description: response.data.description,
        color: response.data.color,
      });
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId, fetchTeamDetails]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await updateTeam(teamId, editData);
      setTeam(response.data);
      setIsEditing(false);
      alert('Team updated successfully');
    } catch (err) {
      setError(err.error || 'Failed to update team');
    }
  };

  const isOwner = String(team?.ownerId) === String(userId) || userRole === 'admin';

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <SkeletonLoader count={5} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
              <Button
                variant="secondary"
                onClick={() => navigate('/teams')}
                className="mt-4"
              >
                Back to Teams
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-gray-600 dark:text-gray-400">Team not found</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="text-3xl sm:text-5xl">{team.icon}</div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {team.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {team.owner?.name || 'Unknown'}
                </p>
              </div>
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded shrink-0"
                style={{ backgroundColor: team.color }}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/teams')}
              className="w-full sm:w-auto"
            >
              Back to Teams
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-none pb-px -mx-3 px-3 sm:mx-0 sm:px-0">
            {['overview', 'members', 'statistics', 'tasks', 'achievements', 'capacity', 'performance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'achievements' && '🏅'}
                {tab === 'capacity' && '📊'}
                {tab === 'performance' && '📈'}
                {tab === 'members' && userRole === 'admin' ? '👨‍💼' : ''} {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Overview</h2>

                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Team Name"
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editData.description || ''}
                          onChange={handleEditChange}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Team Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            name="color"
                            value={editData.color}
                            onChange={handleEditChange}
                            className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                          />
                          <span
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: editData.color }}
                          />
                          <code className="text-sm text-gray-600 dark:text-gray-400">
                            {editData.color}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="primary"
                          onClick={handleSaveChanges}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setEditData({
                              name: team.name,
                              description: team.description,
                              color: team.color,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {team.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Team Color</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: team.color }}
                          />
                          <code className="text-sm text-gray-600 dark:text-gray-400">
                            {team.color}
                          </code>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditing(true)}
                          className="mt-4"
                        >
                          Edit Team
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
                  {userRole === 'admin' && (
                    <>
                      <AdminMemberManagement
                        teamId={teamId}
                        team={team}
                        onUpdate={fetchTeamDetails}
                      />
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6" />
                    </>
                  )}
                  <TeamMembersPanel
                    teamId={teamId}
                    team={team}
                    currentUserRole={userRole}
                    onMembersUpdate={fetchTeamDetails}
                  />
                </div>
              )}

              {activeTab === 'statistics' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TeamStatistics teamId={teamId} />
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Team Tasks
                    </h3>
                    {team.tasks && team.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {team.tasks.map(task => (
                          <div
                            key={task.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Assigned to {task.assignee?.name || 'Unassigned'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                task.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                task.status === 'todo' ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                                {task.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                task.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                task.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No tasks assigned to this team yet</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TeamAchievements teamId={teamId} />
                </div>
              )}

              {activeTab === 'capacity' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TeamCapacityPlanner teamId={teamId} />
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TeamPerformanceDashboard teamId={teamId} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Members</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {team.members?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tasks</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {team.tasks?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Icon Reference */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Team Icon</h3>
                <div className="text-6xl text-center">{team.icon}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamDetail;

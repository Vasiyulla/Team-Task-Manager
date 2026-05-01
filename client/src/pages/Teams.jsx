import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamCard from '../components/TeamCard';
import Button from '../components/Button';
import Input from '../components/Input';
import SkeletonLoader from '../components/SkeletonLoader';
import { getTeams, createTeam, deleteTeam } from '../api/teamClient';

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchQuery]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await getTeams();
      setTeams(response.data || []);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const filterTeams = () => {
    if (!searchQuery.trim()) {
      setFilteredTeams(teams);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = teams.filter(
      team =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query)
    );
    setFilteredTeams(filtered);
  };

  const handleCreateTeam = async (teamData) => {
    try {
      const response = await createTeam(teamData);
      setTeams([...teams, response.data]);
      setIsCreateModalOpen(false);
      alert('Team created successfully!');
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam(teamId);
        setTeams(teams.filter(t => t.id !== teamId));
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }
        alert('Team deleted successfully');
      } catch (err) {
        setError(err.error || 'Failed to delete team');
      }
    }
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(selectedTeam?.id === team.id ? null : team);
  };

  const handleViewTeamDetails = (team) => {
    navigate(`/teams/${team.id}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organize your work by creating and managing teams
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              + Create Team
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon="🔍"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader count={6} />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👥</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {teams.length === 0 ? 'No teams yet' : 'No teams found'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {teams.length === 0
                  ? 'Create your first team to get started with team collaboration'
                  : 'Try adjusting your search query'}
              </p>
              {teams.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create First Team
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div key={team.id} className="space-y-2">
                  <TeamCard
                    team={team}
                    onSelect={() => handleSelectTeam(team)}
                    isSelected={selectedTeam?.id === team.id}
                  />
                  {selectedTeam?.id === team.id && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewTeamDetails(team)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="w-full"
                      >
                        Delete Team
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
    </MainLayout>
  );
};

export default Teams;

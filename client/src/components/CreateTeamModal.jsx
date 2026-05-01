import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam }) => {
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    icon: '👥',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const iconOptions = ['👥', '🚀', '💼', '🎯', '⚡', '🔥', '🌟', '💡', '🎨', '🏆'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleIconSelect = (icon) => {
    setTeamData(prev => ({
      ...prev,
      icon,
    }));
  };

  const handleColorChange = (e) => {
    setTeamData(prev => ({
      ...prev,
      color: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!teamData.name.trim()) {
        setError('Team name is required');
        setLoading(false);
        return;
      }

      await onCreateTeam(teamData);
      setTeamData({
        name: '',
        description: '',
        color: '#8B5CF6',
        icon: '👥',
      });
      onClose();
    } catch (err) {
      setError(err.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          type="text"
          name="name"
          value={teamData.name}
          onChange={handleInputChange}
          placeholder="Enter team name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={teamData.description}
            onChange={handleInputChange}
            placeholder="Enter team description (optional)"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Icon
          </label>
          <div className="grid grid-cols-5 gap-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => handleIconSelect(icon)}
                className={`py-2 text-2xl rounded-lg border-2 transition-all ${
                  teamData.icon === icon
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={teamData.color}
              onChange={handleColorChange}
              className="w-12 h-10 rounded cursor-pointer border border-gray-300"
            />
            <span
              className="w-8 h-8 rounded"
              style={{ backgroundColor: teamData.color }}
            />
            <code className="text-sm text-gray-600 dark:text-gray-400">{teamData.color}</code>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;

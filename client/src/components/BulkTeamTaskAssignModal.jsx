import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

const BulkTeamTaskAssignModal = ({ isOpen, onClose, tasks, teams, onAssign }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
      );
    setError('');
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  const handleAssign = async () => {
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }

    if (selectedTaskIds.length === 0) {
      setError('Please select at least one task');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAssign(selectedTeamId, selectedTaskIds);
      setSelectedTeamId('');
      setSelectedTaskIds([]);
      onClose();
    } catch (err) {
      setError(err.error || 'Failed to assign tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setError('');
        setSelectedTeamId('');
        setSelectedTaskIds([]);
      }}
      title="Assign Tasks to Team"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a team --</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.icon} {team.name} ({team.members?.length || 0} members)
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Tasks ({selectedTaskIds.length} of {tasks.length})
            </label>
            <button
              onClick={handleSelectAll}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              {selectedTaskIds.length === tasks.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            {tasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No tasks available
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {tasks.map(task => (
                  <label
                    key={task.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      task.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {task.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            loading={loading}
          >
            Assign to Team
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkTeamTaskAssignModal;

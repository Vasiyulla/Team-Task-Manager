import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { adminAddTeamMember, adminRemoveTeamMember } from '../api/teamClient';

const AdminMemberManagement = ({ teamId, team, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      setError('Member ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminAddTeamMember(teamId, newMemberId, memberRole);
      setNewMemberId('');
      setMemberRole('member');
      setIsOpen(false);
      onUpdate?.();
      alert('Member added successfully!');
    } catch (err) {
      setError(err.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await adminRemoveTeamMember(teamId, memberId);
        onUpdate?.();
        alert('Member removed successfully!');
      } catch (err) {
        setError(err.error || 'Failed to remove member');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          👨‍💼 Admin Member Management
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          + Add Member
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {/* Modal for adding member */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Admin: Add Member to Team">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <Input
              type="text"
              value={newMemberId}
              onChange={(e) => {
                setNewMemberId(e.target.value);
                setError('');
              }}
              placeholder="Enter user ID or UUID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="member">Member</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                setError('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              loading={loading}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Members List */}
      <div className="space-y-2">
        {team?.members && team.members.length > 0 ? (
          team.members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold shrink-0">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">
                    {member.TeamMember?.role === 'lead' ? '👑 Lead' : 'Member'} • Joined{' '}
                    {new Date(member.TeamMember?.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveMember(member.id)}
                disabled={member.id === team.ownerId}
                title={member.id === team.ownerId ? 'Cannot remove team owner' : 'Remove member'}
                className="w-full sm:w-auto"
              >
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No members in team</p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          ℹ️ As an admin, you can add and remove members from any team without restrictions.
        </p>
      </div>
    </div>
  );
};

export default AdminMemberManagement;

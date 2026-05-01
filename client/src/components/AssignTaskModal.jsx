import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Avatar from './Avatar.jsx';
import Button from './Button.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';
import { Check, UserPlus, Loader } from 'lucide-react';

const AssignTaskModal = ({ isOpen, onClose, task, projectId, onAssignSuccess }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(task?.assigneeId || null);

  // Fetch project members
  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const result = await response.json();
      setMembers(result.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (memberId) => {
    try {
      setAssigning(true);
      const response = await fetch(`/api/tasks/${task.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assigneeId: memberId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign task');
      }

      const result = await response.json();
      setSelectedMemberId(memberId);
      
      // Notify parent component
      if (onAssignSuccess) {
        onAssignSuccess(result.data);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error assigning task:', error);
      alert(error.message || 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      const response = await fetch(`/api/tasks/${task.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assigneeId: null }),
      });

      if (!response.ok) {
        throw new Error('Failed to unassign task');
      }

      const result = await response.json();
      setSelectedMemberId(null);
      
      // Notify parent component
      if (onAssignSuccess) {
        onAssignSuccess(result.data);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error unassigning task:', error);
      alert(error.message || 'Failed to unassign task');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Task"
      size="sm"
    >
      <div className="space-y-4">
        {/* Task Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Task
          </p>
          <p className="font-medium truncate">{task?.title}</p>
        </div>

        {/* Current Assignee */}
        {task?.assignee && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
              Currently assigned to
            </p>
            <div className="flex items-center gap-2">
              <Avatar name={task.assignee.name} size="sm" />
              <div>
                <p className="font-medium text-sm">{task.assignee.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {task.assignee.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="space-y-2">
            <SkeletonLoader count={3} type="card" className="h-12" />
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
              Select team member
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAssign(member.id)}
                  disabled={assigning}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedMemberId === member.id
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  } ${assigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {member.taskLoad} tasks
                    </p>
                  </div>
                  {selectedMemberId === member.id && (
                    <Check size={18} className="text-violet-600 dark:text-violet-400" />
                  )}
                  {assigning && selectedMemberId === member.id && (
                    <Loader size={18} className="animate-spin text-violet-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-600 dark:text-slate-400">
            <p className="text-sm">No members found in this project</p>
          </div>
        )}

        {/* Unassign Button */}
        {task?.assignee && (
          <Button
            variant="secondary"
            onClick={handleUnassign}
            disabled={assigning}
            className="w-full"
          >
            Unassign Task
          </Button>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={assigning}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default AssignTaskModal;

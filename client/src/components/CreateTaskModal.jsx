import React, { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import apiClient from '../api/apiClient.js';
import { toast } from 'sonner';
import { ListPlus, Calendar, AlertTriangle } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, projectId, onSuccess, initialStatus = 'todo' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: initialStatus,
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: initialStatus,
        dueDate: '',
      });
    }
  }, [isOpen, initialStatus]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        projectId,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      };

      const response = await apiClient.post('/tasks', payload);

      toast.success('Task created successfully!');
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      onClose();
    } catch (error) {
      console.error('Create task error:', error);
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-slate-500' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'critical', label: 'Critical', color: 'text-red-500' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
            Task Title *
          </label>
          <input
            id="task-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Design homepage layout"
            className="input-base"
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more details about this task..."
            rows={3}
            className="input-base resize-none"
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label htmlFor="task-priority" className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              id="task-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-base"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-due-date" className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Due Date
            </label>
            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-base"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Priority Preview */}
        {formData.priority === 'critical' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">This task will be marked as critical priority</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!formData.title.trim()}
            className="gap-2"
          >
            <ListPlus size={16} />
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;

import React, { useState } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import apiClient from '../api/apiClient.js';
import { Palette } from 'lucide-react';

const PROJECT_COLORS = [
  '#6366F1', // Violet
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6B7280', // Gray
  '#0EA5E9', // Sky
];

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }
    if (description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/projects', {
        title: title.trim(),
        description: description.trim() || undefined,
        color,
      });

      if (response.data.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setColor('#6366F1');
        setErrors({});
        onSuccess?.(response.data.data);
        onClose();
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(e => {
          mapped[e.field] = e.message;
        });
        setErrors(mapped);
      } else {
        setErrors({ general: err.response?.data?.error || 'Failed to create project' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setColor('#6366F1');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General Error */}
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </div>
        )}

        {/* Title */}
        <Input
          label="Project Title"
          placeholder="e.g. Website Redesign"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* Description */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
            <span className="text-slate-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            placeholder="Brief description of the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`input-base resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className={`text-xs ${description.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
              {description.length}/500
            </p>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Palette size={16} />
            Project Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c
                    ? `0 0 0 3px var(--color-slate-50, #f8fafc), 0 0 0 5px ${c}`
                    : 'none',
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="font-bold text-sm">{title || 'Project Title'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {description || 'Project description will appear here'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!title.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;

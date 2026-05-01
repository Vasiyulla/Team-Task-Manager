import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal.jsx';
import Avatar from './Avatar.jsx';
import Badge from './Badge.jsx';
import Button from './Button.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';
import apiClient from '../api/apiClient.js';
import { toast } from 'sonner';
import {
  Check,
  CheckSquare,
  Square,
  Users,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Loader,
  ListTodo,
  ChevronDown,
  Minus,
  UserPlus,
  Zap,
} from 'lucide-react';

const BulkAssignTaskModal = ({ isOpen, onClose, onSuccess }) => {
  // State
  const [step, setStep] = useState(1); // 1=select tasks, 2=select member
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTaskIds(new Set());
      setSelectedMemberId(null);
      setSearchTerm('');
      setMemberSearchTerm('');
      setFilterProject('all');
      setFilterStatus('all');
      setShowUnassignedOnly(false);
      fetchTasks();
      fetchProjects();
      fetchMembers();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tasks/all');
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get('/users');
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || task.projectId === filterProject;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesUnassigned = !showUnassignedOnly || !task.assigneeId;
      return matchesSearch && matchesProject && matchesStatus && matchesUnassigned;
    });
  }, [tasks, searchTerm, filterProject, filterStatus, showUnassignedOnly]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );
  }, [members, memberSearchTerm]);

  // Selection handlers
  const toggleTask = (taskId) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleAllVisible = () => {
    const allVisibleIds = filteredTasks.map(t => t.id);
    const allSelected = allVisibleIds.every(id => selectedTaskIds.has(id));

    if (allSelected) {
      setSelectedTaskIds(prev => {
        const next = new Set(prev);
        allVisibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedTaskIds(prev => {
        const next = new Set(prev);
        allVisibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const isAllVisibleSelected = filteredTasks.length > 0 &&
    filteredTasks.every(t => selectedTaskIds.has(t.id));

  const isSomeVisibleSelected = filteredTasks.some(t => selectedTaskIds.has(t.id)) && !isAllVisibleSelected;

  // Bulk assign handler
  const handleBulkAssign = async () => {
    if (selectedTaskIds.size === 0 || !selectedMemberId) return;

    try {
      setAssigning(true);
      const response = await apiClient.post('/tasks/bulk-assign', {
        taskIds: Array.from(selectedTaskIds),
        assigneeId: selectedMemberId,
      });

      toast.success(response.data.message || `${selectedTaskIds.size} tasks assigned successfully!`);

      if (onSuccess) {
        onSuccess(response.data.data);
      }
      onClose();
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error(error.response?.data?.error || 'Failed to assign tasks');
    } finally {
      setAssigning(false);
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="xl"
    >
      <div className="min-h-[520px] flex flex-col">
        {/* Custom Header with Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bulk Task Assignment</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 ? 'Select tasks to assign' : 'Choose a team member'}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 1
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-green-500 text-white'
            }`}>
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <div className={`w-12 h-0.5 ${step > 1 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 2
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Select Tasks */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-base pl-9 py-2 text-sm"
                  id="bulk-assign-search"
                />
              </div>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="input-base py-2 text-sm w-full sm:w-40"
                id="bulk-assign-project-filter"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-base py-2 text-sm w-full sm:w-36"
                id="bulk-assign-status-filter"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Unassigned toggle */}
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <button
                  onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    showUnassignedOnly
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
                  }`}
                  id="bulk-assign-unassigned-toggle"
                >
                  {showUnassignedOnly && <Check size={12} />}
                </button>
                <span className="text-slate-600 dark:text-slate-400">Show unassigned only</span>
              </label>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-violet-600 dark:text-violet-400">{selectedTaskIds.size}</span>
                <span>selected</span>
              </div>
            </div>

            {/* Select all visible */}
            {filteredTasks.length > 0 && (
              <button
                onClick={toggleAllVisible}
                className="flex items-center gap-2 mb-3 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
                id="bulk-assign-select-all"
              >
                {isAllVisibleSelected ? (
                  <>
                    <CheckSquare size={16} />
                    <span>Deselect all ({filteredTasks.length})</span>
                  </>
                ) : (
                  <>
                    {isSomeVisibleSelected ? <Minus size={16} /> : <Square size={16} />}
                    <span>Select all ({filteredTasks.length})</span>
                  </>
                )}
              </button>
            )}

            {/* Task List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1.5 pr-1" id="bulk-assign-task-list">
              {loading ? (
                <div className="space-y-2 p-2">
                  <SkeletonLoader count={5} type="card" className="h-14" />
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 text-left transition-all group ${
                      selectedTaskIds.has(task.id)
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    id={`bulk-task-${task.id}`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      selectedTaskIds.has(task.id)
                        ? 'bg-violet-600 border-violet-600 text-white scale-110'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-violet-400'
                    }`}>
                      {selectedTaskIds.has(task.id) && <Check size={12} />}
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.project && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: task.project.color }}
                            />
                            {task.project.title}
                          </span>
                        )}
                        <Badge type="status" variant={task.status}>
                          {task.status}
                        </Badge>
                        <Badge type="priority" variant={task.priority}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Current assignee */}
                    {task.assignee ? (
                      <Avatar name={task.assignee.name} size="sm" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ListTodo size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No tasks found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={selectedTaskIds.size === 0}
                className="gap-2"
              >
                Next: Select Member
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Member */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            {/* Selected Tasks Summary */}
            <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border border-violet-200 dark:border-violet-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                  <ListTodo size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-violet-600/70 dark:text-violet-400/70">
                    Ready to assign to a team member
                  </p>
                </div>
              </div>
            </div>

            {/* Member Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search team members..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                className="input-base pl-9 py-2 text-sm"
                id="bulk-assign-member-search"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto max-h-[320px] space-y-2 pr-1" id="bulk-assign-member-list">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      selectedMemberId === member.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                    }`}
                    id={`bulk-member-${member.id}`}
                  >
                    <Avatar name={member.name} size="md" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {selectedMemberId === member.id && (
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center animate-scale-in">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Users size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No members found</p>
                </div>
              )}
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkAssign}
                disabled={!selectedMemberId || assigning}
                loading={assigning}
                className="gap-2"
              >
                <UserPlus size={16} />
                Assign {selectedTaskIds.size} Task{selectedTaskIds.size !== 1 ? 's' : ''}
                {selectedMember && ` to ${selectedMember.name.split(' ')[0]}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkAssignTaskModal;

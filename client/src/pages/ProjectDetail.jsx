import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AssignTaskModal from '../components/AssignTaskModal.jsx';
import CreateTaskModal from '../components/CreateTaskModal.jsx';
import BulkTeamTaskAssignModal from '../components/BulkTeamTaskAssignModal.jsx';
import { bulkAssignTasksToTeam } from '../api/teamClient';
import { ArrowLeft, Plus, Search, Filter, UserPlus, Users, AlertCircle } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, loading, refetch } = useFetch(`/projects/${id}`);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState('todo');
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  
  // Fetch teams for bulk assignment
  const { data: teamsData } = useFetch('/teams');
  const teams = teamsData || [];

  // Update tasks when project data changes
  React.useEffect(() => {
    if (project?.tasks) {
      setTasks(project.tasks);
    }
  }, [project]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <SkeletonLoader count={1} type="card" className="h-20 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SkeletonLoader count={4} type="card" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <p className="text-lg">Project not found</p>
            <Button variant="primary" onClick={() => navigate('/projects')} className="mt-4">
              Back to Projects
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks?.filter(t => t.status === 'todo') || [],
    'in-progress': tasks?.filter(t => t.status === 'in-progress') || [],
    done: tasks?.filter(t => t.status === 'done') || [],
    overdue: tasks?.filter(t => t.status === 'overdue') || [],
  };

  // Apply filters
  const filterTasks = (taskList) => {
    return taskList.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  };

  const handleOpenAssignModal = (task) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = (updatedTask) => {
    // Update the task in local state
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    refetch();
  };

  const handleOpenCreateTask = (status = 'todo') => {
    setCreateTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    // Add new task to local state and refetch for fresh data
    setTasks(prev => [...prev, newTask]);
    refetch();
  };

  const handleBulkAssign = async (teamId, taskIds) => {
    try {
      await bulkAssignTasksToTeam(teamId, taskIds);
      refetch();
    } catch (err) {
      console.error('Bulk assign failed:', err);
      throw err;
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-700/50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900/30' },
    { id: 'overdue', title: 'Overdue', color: 'bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-xl sm:text-3xl font-bold truncate">{project.title}</h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => setIsBulkAssignOpen(true)}
                className="gap-2 flex-1 sm:flex-none text-sm"
                disabled={!tasks || tasks.length === 0}
              >
                <Users size={16} />
                <span className="hidden sm:inline">Assign to</span> Team
              </Button>
              <Button
                variant="primary"
                onClick={() => handleOpenCreateTask('todo')}
                className="gap-2 flex-1 sm:flex-none text-sm"
                id="create-task-btn"
              >
                <Plus size={16} />
                New Task
              </Button>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-10"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-base"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Kanban Board */}
        <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-6 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory lg:snap-none">
          {columns.map(column => (
            <div key={column.id} className="min-w-[280px] sm:min-w-[300px] snap-start lg:min-w-0">
              {/* Column Header */}
              <div className={`p-4 rounded-lg ${column.color} mb-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">{column.title}</h2>
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-semibold">
                    {filterTasks(tasksByStatus[column.id]).length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[400px]">
                {filterTasks(tasksByStatus[column.id]).map(task => (
                  <Card
                    key={task.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow group"
                  >
                    <div onClick={() => navigate(`/tasks/${task.id}`)}>
                      {task.dependency && task.dependency.status !== 'done' && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] font-bold mb-2">
                          <AlertCircle size={12} /> BLOCKED
                        </div>
                      )}
                      <h3 className="font-semibold mb-3 line-clamp-2">{task.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <Badge type="priority" variant={task.priority}>
                          {task.priority}
                        </Badge>
                        {task.assignee && (
                          <Avatar name={task.assignee.name} size="sm" title={task.assignee.name} />
                        )}
                      </div>
                    </div>

                    {task.dueDate && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}

                    {/* Quick Assign Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAssignModal(task);
                      }}
                    >
                      <UserPlus size={16} />
                      {task.assignee ? 'Reassign' : 'Assign'}
                    </Button>
                  </Card>
                ))}

                {filterTasks(tasksByStatus[column.id]).length === 0 && (
                  <div className="flex items-center justify-center h-32 text-slate-400">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}

                {/* Add task button */}
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => handleOpenCreateTask(column.id)}
                >
                  <Plus size={18} /> Add Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Task Modal */}
      {selectedTask && (
        <AssignTaskModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          task={selectedTask}
          projectId={id}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={id}
        onSuccess={handleTaskCreated}
        initialStatus={createTaskStatus}
      />
      {/* Bulk Team Assign Modal */}
      <BulkTeamTaskAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        tasks={tasks || []}
        teams={teams}
        onAssign={handleBulkAssign}
      />
    </MainLayout>
  );
};

export default ProjectDetail;

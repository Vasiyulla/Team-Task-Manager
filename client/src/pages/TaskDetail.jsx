import React, { useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import Input from '../components/Input.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AssignTaskModal from '../components/AssignTaskModal.jsx';
import { updateTask, deleteTask } from '../api/taskClient';
import { ArrowLeft, Send, MessageCircle, UserPlus, Trash2, Edit, CheckCircle, Clock, Play, Square, AlertCircle, ThumbsUp, RotateCcw, Link2 } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Memoized fetch function to avoid dependency warnings and fix refetch bug
  const fetchTask = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setTaskData(result.data);
        // If team task, fetch team members
        if (result.data.taskType === 'team' && result.data.teamId) {
          fetchTeamMembers(result.data.teamId);
        }
      } else {
        setError('Task not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Alias fetchTask to refetch for compatibility with existing calls
  const refetch = fetchTask;

  // Initial fetch
  React.useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id, fetchTask]);

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const handleDelegate = async (internalAssigneeId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}/delegate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ internalAssigneeId })
      });
      
      const result = await response.json();
      if (result.success) {
        setTaskData(result.data);
      }
    } catch (err) {
      console.error('Failed to delegate task:', err);
    }
  };

  const isLeadOrAdmin = userRole === 'admin' || (teamMembers.find(m => String(m.id) === String(userId))?.TeamMember?.role === 'lead');
  const isAssignee = taskData?.assigneeId === userId;
  const isInternalAssignee = taskData?.internalAssigneeId === userId;
  const isBlocked = taskData?.dependency && taskData.dependency.status !== 'done';

  const handleAssignSuccess = (updatedTask) => {
    refetch();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(`Task moved to ${newStatus}`);
        refetch();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Network error while updating status');
    }
  };

  // Fetch comments
  React.useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        setCommentsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}/comments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setComments(result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (activeTab === 'comments') {
      fetchComments();
    }
  }, [id, activeTab]);



  // Timer Effect
  React.useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        navigate(-1);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 min-h-screen">
          <SkeletonLoader count={3} type="card" />
        </div>
      </MainLayout>
    );
  }

  if (error || !taskData) {
    return (
      <MainLayout>
        <div className="p-6 min-h-screen flex items-center justify-center">
          <Card className="p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold">{error || 'Task not found'}</p>
            <Button variant="primary" onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-3 sm:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline mb-6 font-medium"
          >
            <ArrowLeft size={20} /> Back to Project
          </button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-lg sm:text-2xl font-bold flex-1 mr-2">{taskData.title}</h1>
                <Badge type="status" variant={taskData.status}>
                  {taskData.status}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{taskData.description}</p>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Priority
                  </label>
                  <div className="mt-2">
                    <Badge type="priority" variant={taskData.priority}>
                      {taskData.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Assigned to
                  </label>
                  <div className="mt-2">
                    {taskData.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={taskData.assignee.name} size="sm" />
                        <div className="flex-1">
                          <p className="font-medium">{taskData.assignee.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {taskData.assignee.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400 italic">Unassigned</p>
                    )}
                  </div>
                </div>

                {taskData.dueDate && (
                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Due date
                    </label>
                    <p className="mt-2">
                      {new Date(taskData.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {taskData.project && (
                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Project
                    </label>
                    <p className="mt-2">{taskData.project.title}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs for Comments and Activity */}
            <div className="flex gap-4 mb-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2 px-1 text-sm font-bold transition-colors ${
                  activeTab === 'comments'
                    ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Comments ({comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 px-1 text-sm font-bold transition-colors ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Activity History ({taskData?.activities?.length || 0})
              </button>
            </div>

            <Card className="p-6">
              {activeTab === 'comments' ? (
                <>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageCircle size={20} /> Comments
                  </h2>
    
                  {/* Comment List */}
                  {commentsLoading ? (
                    <SkeletonLoader count={2} type="user" />
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar name={comment.user.name} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{comment.user.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mt-1">{comment.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 mb-6">No comments yet</p>
                  )}
    
                  {/* Add Comment */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="primary" onClick={() => setCommentText('')}>
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageCircle size={20} /> Activity History
                  </h2>
                  <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                    {taskData?.activities && taskData.activities.length > 0 ? (
                      taskData.activities.map((activity) => (
                        <div key={activity.id} className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-500" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {activity.user?.name}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">
                                {new Date(activity.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {activity.description}
                            </p>
                            {(activity.oldValue || activity.newValue) && (
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 line-through">
                                  {activity.oldValue}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded font-bold">
                                  {activity.newValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No activity recorded yet.</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20 border-t-4 border-t-violet-500">
              {/* Dependency Warning */}
              {isBlocked && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs mb-1">
                    <AlertCircle size={14} /> TASK BLOCKED
                  </div>
                  <p className="text-[10px] text-red-600 dark:text-red-500">
                    This task is waiting for <Link to={`/tasks/${taskData.dependency.id}`} className="underline font-bold">"{taskData.dependency.title}"</Link> to be finished.
                  </p>
                </div>
              )}

              {/* Timer Section */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Work Timer</span>
                  {isTimerRunning && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white mb-4 text-center">
                  {formatTime(time)}
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning ? (
                    <Button 
                      variant="primary" 
                      className="flex-1 gap-2"
                      onClick={() => setIsTimerRunning(true)}
                      disabled={taskData.status === 'done' || isBlocked}
                    >
                      <Play size={16} /> Start
                    </Button>
                  ) : (
                    <Button 
                      variant="danger" 
                      className="flex-1 gap-2"
                      onClick={() => setIsTimerRunning(false)}
                    >
                      <Square size={16} /> Stop
                    </Button>
                  )}
                </div>
              </div>

              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-slate-400">Workflow Actions</h3>
              
              {/* Internal Delegation for Team Leads */}
              {taskData.taskType === 'team' && isLeadOrAdmin && (
                <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/20">
                  <div className="flex items-center gap-2 mb-3 text-violet-700 dark:text-violet-400">
                    <UserPlus size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Internal Delegation</span>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={taskData.internalAssigneeId || ''}
                      onChange={(e) => handleDelegate(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select Member</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    {taskData.internalAssignee && (
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-900/30">
                        <Avatar name={taskData.internalAssignee.name} size="xs" />
                        <span className="text-[10px] font-medium truncate">Assigned to: {taskData.internalAssignee.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Status Logic */}
                {taskData.status === 'todo' && (isAssignee || (taskData.taskType === 'team' && (isInternalAssignee || isLeadOrAdmin))) && (
                  <Button 
                    variant="primary" 
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusChange('in-progress')}
                    disabled={isBlocked}
                  >
                    <Play size={18} /> {isBlocked ? 'Task Blocked' : 'Start Working'}
                  </Button>
                )}

                {taskData.status === 'in-progress' && (isAssignee || (taskData.taskType === 'team' && (isInternalAssignee || isLeadOrAdmin))) && (
                  <Button 
                    variant="primary" 
                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleStatusChange('in-review')}
                  >
                    <Send size={18} /> Submit for Review
                  </Button>
                )}

                {taskData.status === 'in-review' && isLeadOrAdmin && (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg mb-2">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                        <AlertCircle size={14} /> Pending your approval
                      </p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange('done')}
                    >
                      <ThumbsUp size={18} /> Approve & Finish
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full gap-2"
                      onClick={() => handleStatusChange('in-progress')}
                    >
                      <RotateCcw size={18} /> Send for Revision
                    </Button>
                  </div>
                )}

                {taskData.status === 'done' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">Task Completed</p>
                    <p className="text-[10px] text-green-600 dark:text-green-500 mt-1">Verified by Admin/Lead</p>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    <UserPlus size={14} />
                    {taskData.assignee ? 'Reassign Task' : 'Assign to Member'}
                  </Button>
                  
                  {isLeadOrAdmin && (
                    <Button 
                      variant="danger" 
                      className="w-full gap-2 opacity-50 hover:opacity-100 text-xs"
                      onClick={handleDeleteTask}
                    >
                      <Trash2 size={14} />
                      Archive Task
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      {isAssignModalOpen && (
        <AssignTaskModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          task={taskData}
          projectId={taskData?.project?.id}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </MainLayout>
  );
};

export default TaskDetail;

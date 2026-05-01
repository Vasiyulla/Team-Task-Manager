import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import Input from '../components/Input.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AssignTaskModal from '../components/AssignTaskModal.jsx';
import { ArrowLeft, Send, MessageCircle, UserPlus } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, loading, refetch } = useFetch(`/tasks/${id}`);
  const { data: comments, loading: commentsLoading } = useFetch(`/tasks/${id}/comments`);
  const [commentText, setCommentText] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskData, setTaskData] = useState(task);

  // Update local task data when fetch completes
  React.useEffect(() => {
    if (task) {
      setTaskData(task);
    }
  }, [task]);

  const handleAssignSuccess = (updatedTask) => {
    setTaskData(updatedTask);
    refetch();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <SkeletonLoader count={3} type="card" />
        </div>
      </MainLayout>
    );
  }

  if (!taskData) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <p className="text-lg">Task not found</p>
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
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold flex-1">{taskData.title}</h1>
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

            {/* Comments */}
            <Card className="p-6">
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
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  <UserPlus size={18} />
                  {taskData.assignee ? 'Reassign' : 'Assign'}
                </Button>
                <Button variant="secondary" className="w-full">
                  Edit Task
                </Button>
                <Button variant="secondary" className="w-full">
                  Change Status
                </Button>
                <Button variant="danger" className="w-full">
                  Delete Task
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        task={taskData}
        projectId={taskData?.project?.id}
        onAssignSuccess={handleAssignSuccess}
      />
    </MainLayout>
  );
};

export default TaskDetail;

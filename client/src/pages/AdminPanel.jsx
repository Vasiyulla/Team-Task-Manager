import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import BulkAssignTaskModal from '../components/BulkAssignTaskModal.jsx';
import { Users, Zap, ListTodo, ChevronRight, UserPlus } from 'lucide-react';
import Button from '../components/Button.jsx';

const AdminPanel = () => {
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useFetch('/users');
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useFetch('/tasks');
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  // Calculate real task counts per user
  const getUserTaskCount = (userId) => {
    if (!tasks) return 0;
    return tasks.filter(t => t.assigneeId === userId).length;
  };

  const getUserCompletedCount = (userId) => {
    if (!tasks) return 0;
    return tasks.filter(t => t.assigneeId === userId && t.status === 'done').length;
  };

  const getUserPendingCount = (userId) => {
    if (!tasks) return 0;
    return tasks.filter(t => t.assigneeId === userId && t.status !== 'done').length;
  };

  const unassignedCount = tasks?.filter(t => !t.assigneeId).length || 0;

  const handleBulkAssignSuccess = () => {
    refetchTasks();
    refetchUsers();
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users size={32} /> Admin Panel
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage users, assign tasks, and monitor team workload
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsBulkAssignOpen(true)}
            className="gap-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow"
            id="bulk-assign-open-btn"
          >
            <Zap size={18} />
            Bulk Assign Tasks
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-bl-full" />
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Members</p>
            <p className="text-2xl font-bold mt-1">{users?.length || 0}</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-bl-full" />
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <ListTodo size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Tasks</p>
            <p className="text-2xl font-bold mt-1">{tasks?.length || 0}</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-bl-full" />
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <UserPlus size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Unassigned Tasks</p>
            <p className="text-2xl font-bold mt-1">{unassignedCount}</p>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-bl-full" />
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Admins</p>
            <p className="text-2xl font-bold mt-1">{users?.filter(u => u.role === 'admin').length || 0}</p>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card className="overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold">Team Members & Workload</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsBulkAssignOpen(true)}
              className="gap-1.5"
              id="bulk-assign-table-btn"
            >
              <Zap size={14} />
              Assign Tasks
            </Button>
          </div>

          {usersLoading ? (
            <div className="p-6">
              <SkeletonLoader count={5} type="user" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total Tasks</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Pending</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Completed</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const totalTasks = getUserTaskCount(user.id);
                    const completedTasks = getUserCompletedCount(user.id);
                    const pendingTasks = getUserPendingCount(user.id);
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          index % 2 === 0
                            ? 'bg-white dark:bg-slate-800/50'
                            : 'bg-slate-50/50 dark:bg-slate-800'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size="sm" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                            {totalTasks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                            {pendingTasks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                            {completedTasks}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-[36px]">
                              {progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => {
                  const totalTasks = getUserTaskCount(user.id);
                  const completedTasks = getUserCompletedCount(user.id);
                  const pendingTasks = getUserPendingCount(user.id);
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  return (
                    <div key={user.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg text-center">
                          <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Total</p>
                          <p className="text-sm font-bold">{totalTasks}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg text-center">
                          <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending</p>
                          <p className="text-sm font-bold">{pendingTasks}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded-lg text-center">
                          <p className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400">Done</p>
                          <p className="text-sm font-bold">{completedTasks}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                          <span>Workload Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">No users found</p>
            </div>
          )}
        </Card>

        {/* Unassigned Tasks Quick View */}
        {unassignedCount > 0 && (
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus size={20} className="text-amber-600 dark:text-amber-400" />
                  Unassigned Tasks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {unassignedCount} task{unassignedCount !== 1 ? 's' : ''} waiting to be assigned
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBulkAssignOpen(true)}
                className="gap-1.5"
                id="bulk-assign-unassigned-btn"
              >
                <Zap size={14} />
                Assign Now
              </Button>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {tasks?.filter(t => !t.assigneeId).slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.project?.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.project?.title || 'Unknown Project'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge type="priority" variant={task.priority}>
                      {task.priority}
                    </Badge>
                    <Badge type="status" variant={task.status}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {unassignedCount > 5 && (
                <div className="px-6 py-3 text-center">
                  <button
                    onClick={() => setIsBulkAssignOpen(true)}
                    className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium"
                  >
                    View all {unassignedCount} unassigned tasks →
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Bulk Assign Modal */}
      <BulkAssignTaskModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        onSuccess={handleBulkAssignSuccess}
      />
    </MainLayout>
  );
};

export default AdminPanel;

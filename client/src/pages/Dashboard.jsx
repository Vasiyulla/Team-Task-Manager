import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import MainLayout from '../layouts/MainLayout.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { CheckCircle, Circle, AlertCircle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: tasks, loading: tasksLoading } = useFetch('/tasks');

  // Mock data for chart
  const chartData = [
    { day: 'Mon', completed: 4, pending: 3 },
    { day: 'Tue', completed: 3, pending: 5 },
    { day: 'Wed', completed: 6, pending: 2 },
    { day: 'Thu', completed: 5, pending: 4 },
    { day: 'Fri', completed: 7, pending: 1 },
    { day: 'Sat', completed: 2, pending: 2 },
    { day: 'Sun', completed: 3, pending: 1 },
  ];

  // Calculate stats
  const stats = {
    total: tasks?.length || 0,
    done: tasks?.filter(t => t.status === 'done').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in-progress').length || 0,
    overdue: tasks?.filter(t => t.status === 'overdue').length || 0,
  };

  // Get my assigned tasks
  const myTasks = tasks?.filter(t => t.assigneeId === user?.id)?.slice(0, 5) || [];

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your tasks today
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tasksLoading ? (
            <SkeletonLoader count={4} type="card" />
          ) : (
            <>
              <StatCard
                icon={<Circle size={24} />}
                label="Total Tasks"
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={<CheckCircle size={24} />}
                label="Completed"
                value={stats.done}
                color="green"
              />
              <StatCard
                icon={<Zap size={24} />}
                label="In Progress"
                value={stats.inProgress}
                color="violet"
              />
              <StatCard
                icon={<AlertCircle size={24} />}
                label="Overdue"
                value={stats.overdue}
                color="red"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-bold mb-6">Task Completion Trend</h2>
            {tasksLoading ? (
              <SkeletonLoader count={1} type="card" className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200)" />
                  <XAxis dataKey="day" stroke="var(--color-slate-600)" />
                  <YAxis stroke="var(--color-slate-600)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-slate-900)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* My Tasks */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">My Tasks</h2>
            {tasksLoading ? (
              <SkeletonLoader count={3} type="task" />
            ) : myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.map(task => {
                  const isBlocked = task.dependency && task.dependency.status !== 'done';
                  return (
                    <Link key={task.id} to={`/tasks/${task.id}`} className="block transition-transform hover:scale-[1.01]">
                      <div className={`p-3 rounded-lg border ${isBlocked ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-slate-50 dark:bg-slate-700/50 border-transparent'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm truncate">{task.title}</p>
                          {isBlocked && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] font-bold">
                              <AlertCircle size={10} /> BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge type="priority" variant={task.priority}>
                            {task.priority}
                          </Badge>
                          <Badge type="status" variant={task.status}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                No tasks assigned to you
              </p>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <Card className="p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
};

export default Dashboard;

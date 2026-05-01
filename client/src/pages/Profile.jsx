import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '../lib/validationSchemas.js';
import { User, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, logout, darkMode, toggleDarkMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const colorOptions = [
    '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  ];

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
      reset();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <User size={32} /> Profile Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Avatar Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Profile Picture</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar name={user?.name} size="xl" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your initials are displayed as your profile picture
              </p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color, i) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      i === 0 ? 'border-slate-900 dark:border-slate-50' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Role
              </label>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Your role determines which actions you can perform
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" loading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Preferences */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Use dark theme for better visibility
                </p>
              </div>
              <label className="flex cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  className="sr-only"
                />
                <div className={`w-14 h-8 rounded-full transition-colors ${
                  darkMode ? 'bg-violet-600' : 'bg-slate-300'
                }`}>
                  <div className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </div>
              </label>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="font-medium mb-2">Email Notifications</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Notify me when assigned to a task</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Notify me when a task is commented on</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">Notify me of daily summary</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 dark:border-red-900">
          <h2 className="text-lg font-bold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Be careful with these actions. They cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
          >
            <LogOut size={18} /> Logout
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;

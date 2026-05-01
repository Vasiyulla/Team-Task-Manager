import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Menu, X, Moon, Sun, LogOut, Settings, Workflow } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, darkMode, toggleDarkMode, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    ...(user?.role === 'admin' ? [{ label: 'Admin', path: '/admin', icon: '⚙️' }] : []),
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 fixed lg:relative h-screen z-40`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <Workflow size={20} className="text-white" />
              </div>
              <span className="font-bold">Task Manager</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''} ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <Link
            to="/profile"
            className={`sidebar-nav-item ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Profile' : ''}
          >
            <Settings size={20} />
            {sidebarOpen && <span>Profile</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between">
          <div className="flex lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1" />

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <Avatar name={user?.name} size="sm" />
                <span className="hidden sm:inline font-medium text-sm">{user?.name}</span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 first:rounded-t-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400 flex items-center gap-2 last:rounded-b-lg"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;

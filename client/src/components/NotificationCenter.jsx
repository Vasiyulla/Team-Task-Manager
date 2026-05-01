import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash, User, Calendar, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllAsRead } from '../api/notificationClient';
import { Link } from 'react-router-dom';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <Calendar className="text-blue-500" size={16} />;
      case 'review_requested': return <Clock className="text-amber-500" size={16} />;
      case 'review_approved': return <Check className="text-green-500" size={16} />;
      case 'role_changed': return <ShieldCheck className="text-purple-500" size={16} />;
      default: return <Bell className="text-slate-500" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] text-violet-600 hover:underline font-bold uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b border-slate-50 dark:border-slate-800 transition-colors flex gap-3 ${!notification.isRead ? 'bg-violet-50/30 dark:bg-violet-900/10' : 'opacity-70'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs font-bold truncate ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <button 
                          onClick={() => handleMarkRead(notification.id)}
                          className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-1"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 text-center border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest">
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

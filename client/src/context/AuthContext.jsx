import React, { createContext, useCallback, useEffect, useState } from 'react';
import apiClient from '../api/apiClient.js';
import { toast } from 'sonner';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  /**
   * Initialize dark mode
   */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  /**
   * Auto-login on mount using refresh token
   */
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to get current user
        const response = await apiClient.get('/users/me');
        const currentUser = response.data.data;
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Ensure localStorage is in sync
        localStorage.setItem('userId', currentUser.id);
        localStorage.setItem('userRole', currentUser.role);
      } catch (error) {
        // Token is invalid, clear and redirect
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  /**
   * Sign up new user
   */
  const signup = useCallback(async (name, email, password, role = 'member', adminSecret = '') => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
        role,
        adminSecret,
      });

      const { user: newUser, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', newUser.id);
      localStorage.setItem('userRole', newUser.role);
      setUser(newUser);
      setIsAuthenticated(true);
      toast.success('Welcome! Account created successfully.');
      return newUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in user
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user: loggedInUser, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', loggedInUser.id);
      localStorage.setItem('userRole', loggedInUser.role);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      toast.success('Login successful');
      return loggedInUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      toast.success('Logged out successfully');
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      const response = await apiClient.patch('/users/me', updates);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    darkMode,
    toggleDarkMode,
    signup,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

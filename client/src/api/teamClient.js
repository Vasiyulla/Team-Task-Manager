import apiClient from './apiClient.js';

// ========================================
// TEAM CRUD OPERATIONS
// ========================================

/**
 * Get all teams for the user
 */
export const getTeams = async (searchQuery = '') => {
  try {
    const response = await apiClient.get('/teams', {
      params: { search: searchQuery },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch teams' };
  }
};

/**
 * Get a specific team by ID
 */
export const getTeamById = async (teamId) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch team' };
  }
};

/**
 * Create a new team
 */
export const createTeam = async (teamData) => {
  try {
    const response = await apiClient.post('/teams', teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create team' };
  }
};

/**
 * Update team details
 */
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await apiClient.put(`/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update team' };
  }
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete team' };
  }
};

// ========================================
// TEAM MEMBER MANAGEMENT
// ========================================

/**
 * Add a member to a team
 */
export const addTeamMember = async (teamId, emailOrUserId, role = 'member') => {
  try {
    // Determine if it's an email or userId
    const isEmail = emailOrUserId.includes('@');
    
    const payload = {
      role,
    };

    if (isEmail) {
      payload.email = emailOrUserId;
    } else {
      payload.userId = emailOrUserId;
    }

    const response = await apiClient.post(`/teams/${teamId}/members`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to add member' };
  }
};

/**
 * Remove a member from a team
 */
export const removeTeamMember = async (teamId, memberId) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to remove member' };
  }
};

/**
 * Update team member role
 */
export const updateTeamMemberRole = async (teamId, memberId, role) => {
  try {
    const response = await apiClient.put(`/teams/${teamId}/members/${memberId}`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update member role' };
  }
};

// ========================================
// TEAM LEAD MANAGEMENT
// ========================================

/**
 * Set a member as the primary lead of the team
 */
export const setPrimaryLead = async (teamId, userId) => {
  try {
    const response = await apiClient.put(`/teams/${teamId}/primary-lead/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to set primary lead' };
  }
};

/**
 * Toggle a member's team lead status
 */
export const toggleTeamLeadStatus = async (teamId, memberId, isLead) => {
  try {
    const response = await apiClient.put(
      `/teams/${teamId}/members/${memberId}/lead-status`,
      { isLead }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update lead status' };
  }
};

/**
 * Get all team leads and primary lead information
 */
export const getTeamLeads = async (teamId) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/leads`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch team leads' };
  }
};

// ========================================
// TEAM STATISTICS & METRICS
// ========================================

/**
 * Get team statistics
 */
export const getTeamStatistics = async (teamId) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/statistics`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch team statistics' };
  }
};

/**
 * Get team activity feed
 */
export const getTeamActivity = async (teamId, limit = 20) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/activity`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch team activity' };
  }
};

// ========================================
// BULK TASK OPERATIONS
// ========================================

/**
 * Bulk assign tasks to a team
 */
export const bulkAssignTasksToTeam = async (teamId, taskIds) => {
  try {
    const response = await apiClient.post(`/teams/${teamId}/tasks/bulk-assign`, {
      taskIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to assign tasks to team' };
  }
};

// ========================================
// ADMIN MEMBER MANAGEMENT
// ========================================

/**
 * Admin: Add member to team (no role restrictions)
 */
export const adminAddTeamMember = async (teamId, userId, role = 'member') => {
  try {
    const response = await apiClient.post(`/teams/${teamId}/admin/members`, {
      userId,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to add member' };
  }
};

/**
 * Admin: Remove member from team
 */
export const adminRemoveTeamMember = async (teamId, memberId) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/admin/members/${memberId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to remove member' };
  }
};

// ========================================
// INNOVATIVE FEATURES
// ========================================

/**
 * Get team capacity and workload planning
 */
export const getTeamCapacity = async (teamId) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/capacity`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch team capacity' };
  }
};

/**
 * Get team performance trends
 */
export const getTeamPerformanceTrends = async (teamId, days = 30) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/performance-trends`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch performance trends' };
  }
};

/**
 * Get team achievements and leaderboard
 */
export const getTeamAchievements = async (teamId) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/achievements`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch achievements' };
  }
};

/**
 * Smart assign tasks based on workload
 */
export const smartAssignTasks = async (teamId, taskIds) => {
  try {
    const response = await apiClient.post(`/teams/${teamId}/tasks/smart-assign`, {
      taskIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to smart assign tasks' };
  }
};

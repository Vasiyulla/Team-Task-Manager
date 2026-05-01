import apiClient from './apiClient';

/**
 * Get a specific task by ID
 */
export const getTask = async (id) => {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Update a task
 */
export const updateTask = async (id, data) => {
  const response = await apiClient.patch(`/tasks/${id}`, data);
  return response.data;
};

/**
 * Assign a task
 */
export const assignTask = async (id, userId) => {
  const response = await apiClient.patch(`/tasks/${id}/assign`, { userId });
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Delegate a team task internally
 */
export const delegateTask = async (id, internalAssigneeId) => {
  const response = await apiClient.patch(`/tasks/${id}/delegate`, { internalAssigneeId });
  return response.data;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
});

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: getHeaders(),
  });
  return response.json();
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return response.json();
};

export const markAllAsRead = async () => {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return response.json();
};

import { Notification } from '../models/index.js';

export const createNotification = async ({ userId, type, title, message, relatedId }) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

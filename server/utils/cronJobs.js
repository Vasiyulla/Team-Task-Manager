import cron from 'node-cron';
import { Task } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Schedule all recurring background jobs
 */
export const scheduleCronJobs = () => {
  // Run every day at midnight to check for overdue tasks
  cron.schedule('0 0 * * *', async () => {
    await markOverdueTasks();
  });

  console.log('Cron jobs scheduled successfully');
};

/**
 * Mark tasks as overdue if due date has passed and status is not 'done'
 */
const markOverdueTasks = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.lt]: today,
        },
        status: {
          [Op.ne]: 'done',
        },
      },
    });

    if (tasks.length === 0) {
      console.log(`[${new Date().toISOString()}] No tasks to mark as overdue`);
      return;
    }

    for (const task of tasks) {
      if (task.status !== 'overdue') {
        await task.update({ status: 'overdue' });
      }
    }

    console.log(`[${new Date().toISOString()}] Marked ${tasks.length} tasks as overdue`);
  } catch (error) {
    console.error('[Cron Job Error] Failed to mark overdue tasks:', error);
  }
};

// Optional: Run mark overdue on server startup (in case server was down)
export const runInitialOverdueCheck = async () => {
  try {
    await markOverdueTasks();
  } catch (error) {
    console.error('Initial overdue check failed:', error);
  }
};

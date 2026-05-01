import express from 'express';
import * as taskController from '../controllers/taskController.js';
import * as bulkTaskController from '../controllers/bulkTaskController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/rbac.js';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskFilters,
  validateUUID,
} from '../utils/validators.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Get tasks with filters
router.get('/', validateTaskFilters, taskController.getTasks);

// Admin only - bulk operations (must be before /:id routes)
router.get('/all', restrictTo('admin'), bulkTaskController.getAllTasks);
router.post('/bulk-assign', restrictTo('admin'), bulkTaskController.bulkAssignTasks);

// Get specific task
router.get('/:id', validateUUID, taskController.getTask);

// Assign task (admin or project owner)
router.patch('/:id/assign', validateUUID, taskController.assignTask);

// Admin only routes
router.post('/', restrictTo('admin'), validateCreateTask, taskController.createTask);
router.patch('/:id', validateUUID, validateUpdateTask, taskController.updateTask);
router.delete('/:id', restrictTo('admin'), validateUUID, taskController.deleteTask);

export default router;

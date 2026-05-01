import express from 'express';
import {
  createIndividualTask,
  createTeamTask,
  delegateTeamTask,
  getMyTasks,
  getTeamTasks,
  getTaskAssignmentHistory,
} from '../controllers/teamTaskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Task Assignment Routes - Team vs Individual Architecture
 */

// Individual task routes
router.post('/individual', protect, authorize('admin', 'project_lead'), createIndividualTask);
router.get('/my-tasks', protect, getMyTasks);

// Team task routes
router.post('/team', protect, authorize('admin'), createTeamTask);
router.post('/:taskId/delegate', protect, delegateTeamTask);
router.get('/team/:teamId', protect, getTeamTasks);

// Assignment history and audit trail
router.get('/:taskId/history', protect, getTaskAssignmentHistory);

export default router;

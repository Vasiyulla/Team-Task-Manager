import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/rbac.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateInviteMember,
  validateUUID,
} from '../utils/validators.js';

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Public read routes (for members)
router.get('/', projectController.getMyProjects);
router.get('/:id', validateUUID, projectController.getProject);
router.get('/:id/members', validateUUID, projectController.getMembers);

// Admin only routes
router.post('/', restrictTo('admin'), validateCreateProject, projectController.createProject);
router.patch('/:id', restrictTo('admin'), validateUUID, validateUpdateProject, projectController.updateProject);
router.delete('/:id', restrictTo('admin'), validateUUID, projectController.deleteProject);
router.post('/:id/invite', restrictTo('admin'), validateUUID, validateInviteMember, projectController.inviteMember);

export default router;

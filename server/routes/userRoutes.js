import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/rbac.js';
import { validateUUID } from '../utils/validators.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Get current user profile
router.get('/me', userController.getMe);

// Update current user profile
router.patch('/me', userController.updateProfile);

// Global user list (available to all authenticated users for selection)
router.get('/', userController.getAllUsers);
router.get('/:id/workload', restrictTo('admin'), validateUUID, userController.getUserWorkload);
router.get('/:id/projects', validateUUID, userController.getUserProjects);

export default router;

import express from 'express';
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validateCreateComment, validateUUID } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

// All comment routes require authentication
router.use(protect);

// Get comments for a task
router.get('/:id/comments', validateUUID, commentController.getComments);

// Create comment on a task
router.post('/:id/comments', validateUUID, validateCreateComment, commentController.createComment);

// Delete comment (own or admin)
router.delete('/:id/comments/:commentId', validateUUID, commentController.deleteComment);

export default router;

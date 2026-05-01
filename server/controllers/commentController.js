import { Comment, Task, User } from '../models/index.js';

/**
 * GET /api/tasks/:id/comments
 * Get all comments for a task
 */
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const comments = await Comment.findAll({
      where: { taskId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: comments,
      message: 'Comments retrieved successfully',
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve comments',
    });
  }
};

/**
 * POST /api/tasks/:id/comments
 * Create a new comment on a task
 */
export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const userId = req.userId;

    // Verify task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const comment = await Comment.create({
      taskId: id,
      userId,
      body,
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: commentWithUser,
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create comment',
    });
  }
};

/**
 * DELETE /api/tasks/:id/comments/:commentId
 * Delete a comment (own comments or admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check ownership or admin
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this comment',
      });
    }

    await comment.destroy();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
    });
  }
};

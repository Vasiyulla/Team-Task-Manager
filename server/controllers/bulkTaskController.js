import { Task, User, Project, ProjectMember } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * POST /api/tasks/bulk-assign
 * Bulk assign multiple tasks to a single member (admin only)
 * Body: { taskIds: [...], assigneeId: "uuid" }
 */
export const bulkAssignTasks = async (req, res) => {
  try {
    const { taskIds, assigneeId } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds must be a non-empty array',
      });
    }

    if (taskIds.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Cannot assign more than 50 tasks at once',
      });
    }

    // Validate assignee exists (if provided, null = unassign)
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          error: 'Assignee user not found',
        });
      }
    }

    // Find all tasks
    const tasks = await Task.findAll({
      where: {
        id: { [Op.in]: taskIds },
      },
    });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No tasks found with the provided IDs',
      });
    }

    // If assigning (not unassigning), verify the assignee is a member of each task's project
    if (assigneeId) {
      const projectIds = [...new Set(tasks.map(t => t.projectId))];

      for (const projectId of projectIds) {
        const project = await Project.findByPk(projectId);
        if (!project) continue;

        const isMember = await ProjectMember.findOne({
          where: { projectId, userId: assigneeId },
        });

        if (!isMember && project.ownerId !== assigneeId) {
          // Auto-add user as project member for admin convenience
          await ProjectMember.create({
            projectId,
            userId: assigneeId,
          });
        }
      }
    }

    // Bulk update
    await Task.update(
      { assigneeId: assigneeId || null },
      {
        where: {
          id: { [Op.in]: taskIds },
        },
      }
    );

    // Fetch updated tasks with details
    const updatedTasks = await Task.findAll({
      where: {
        id: { [Op.in]: taskIds },
      },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: updatedTasks,
      message: `${updatedTasks.length} task(s) ${assigneeId ? 'assigned' : 'unassigned'} successfully`,
    });
  } catch (error) {
    console.error('Bulk assign tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to bulk assign tasks',
    });
  }
};

/**
 * GET /api/tasks/all
 * Get ALL tasks across all projects (admin only) — for bulk assignment UI
 */
export const getAllTasks = async (req, res) => {
  try {
    const { projectId, status, unassigned } = req.query;

    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (unassigned === 'true') where.assigneeId = null;

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: 'All tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve all tasks',
    });
  }
};

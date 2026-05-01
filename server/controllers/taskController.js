import { Task, User, Project, ProjectMember } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * GET /api/tasks
 * Get tasks with optional filters (project, assignee, status, priority, search)
 */
export const getTasks = async (req, res) => {
  try {
    const { project, assignee, status, priority, search } = req.query;
    const userId = req.userId;

    // Build where clause
    const where = {};

    if (project) where.projectId = project;
    if (assignee) where.assigneeId = assignee;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // If not admin, only show tasks from user's projects
    if (req.userRole !== 'admin') {
      // Get user's project IDs
      const userProjects = await ProjectMember.findAll({
        where: { userId },
        attributes: ['projectId'],
      });
      const projectIds = userProjects.map(pm => pm.projectId);

      // Also get projects owned by user
      const ownedProjects = await Project.findAll({
        where: { ownerId: userId },
        attributes: ['id'],
      });
      const ownedProjectIds = ownedProjects.map(p => p.id);

      const allProjectIds = [...projectIds, ...ownedProjectIds];

      where.projectId = {
        [Op.in]: allProjectIds.length > 0 ? allProjectIds : [null],
      };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color'],
        },
      ],
      order: [['dueDate', 'ASC'], ['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks',
    });
  }
};

/**
 * POST /api/tasks
 * Create a new task (admin only)
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, assigneeId, dueDate } = req.body;
    const userId = req.userId;

    // Verify project exists and user is owner/member
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: taskWithDetails,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
};

/**
 * GET /api/tasks/:id
 * Get a specific task
 */
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color', 'ownerId'],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
      message: 'Task retrieved successfully',
    });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve task',
    });
  }
};

/**
 * PATCH /api/tasks/:id
 * Update a task (admin or assignee can update status/priority)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Authorization: admin can always update, member can only update their assigned tasks
    const isAssignee = task.assigneeId === userId;
    const isAdmin = userRole === 'admin';

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this task',
      });
    }

    // Members can only update status and priority of their tasks
    if (!isAdmin && isAssignee) {
      if (title || description || assigneeId || dueDate) {
        return res.status(403).json({
          success: false,
          error: 'Members can only update task status and priority',
        });
      }
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'color'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
};

/**
 * PATCH /api/tasks/:id/assign
 * Assign or reassign a task to a team member
 */
export const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Find task
    const task = await Task.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'ownerId'],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Authorization: Only admin or project owner can assign tasks
    if (userRole !== 'admin' && task.project.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to assign this task',
      });
    }

    // If assigneeId is provided, verify user exists and is a project member
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if user is a project member
      const isMember = await ProjectMember.findOne({
        where: {
          projectId: task.projectId,
          userId: assigneeId,
        },
      });

      if (!isMember && task.project.ownerId !== assigneeId) {
        return res.status(400).json({
          success: false,
          error: 'User is not a member of this project',
        });
      }
    }

    // Update task assignment
    task.assigneeId = assigneeId || null;
    await task.save();

    // Return updated task with details
    const updatedTask = await Task.findByPk(id, {
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
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: `Task ${assigneeId ? 'assigned' : 'unassigned'} successfully`,
    });
  } catch (error) {
    console.error('Assign task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assign task',
    });
  }
};

/**
 * GET /api/projects/:projectId/members
 * Get all members of a project (for task assignment dropdown)
 */
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Get project to verify it exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Get all project members
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email'],
        },
      ],
    });

    // Also include project owner
    const owner = await User.findByPk(project.ownerId, {
      attributes: ['id', 'name', 'avatar', 'email'],
    });

    const membersList = members.map(m => m.User);
    
    // Add owner if not already in members
    if (owner && !membersList.find(m => m.id === owner.id)) {
      membersList.unshift(owner);
    }

    return res.status(200).json({
      success: true,
      data: membersList,
      message: 'Project members retrieved successfully',
    });
  } catch (error) {
    console.error('Get project members error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project members',
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task (admin only)
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    });
  }
};

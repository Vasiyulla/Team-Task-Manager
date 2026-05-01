import { Task, User, Project, ProjectMember, Team, TeamMember, TaskActivity } from '../models/index.js';
import { createNotification } from '../utils/notifications.js';
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
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'icon', 'color'],
        },
        {
          model: Task,
          as: 'dependency',
          attributes: ['id', 'title', 'status'],
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
    const { title, description, projectId, priority, assigneeId, teamId, taskType, dueDate, dependsOnTaskId } = req.body;
    const userId = req.userId;

    // Verify project exists and user is owner/member
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Authorization: Only admin or project owner can create tasks
    if (req.userRole !== 'admin' && project.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to create tasks in this project',
      });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      projectId,
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      teamId: teamId || null,
      taskType: taskType || 'individual',
      dueDate,
      dependsOnTaskId,
    });

    if (assigneeId && taskType === 'individual') {
      await createNotification({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${title}`,
        relatedId: task.id,
      });
    }

    if (taskType === 'team' && teamId) {
      // Notify Team Lead(s)
      const leads = await TeamMember.findAll({
        where: { teamId, role: 'lead' }
      });
      for (const lead of leads) {
        await createNotification({
          userId: lead.userId,
          type: 'task_assigned',
          title: 'New Team Task',
          message: `Your team has been assigned a new task: ${title}`,
          relatedId: task.id,
        });
      }
    }

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
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'icon', 'color'],
        },
        {
          model: TaskActivity,
          as: 'activities',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
        {
          model: Task,
          as: 'dependency',
          attributes: ['id', 'title', 'status'],
        },
      ],
      order: [[{ model: TaskActivity, as: 'activities' }, 'createdAt', 'DESC']],
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
    const { title, description, status, priority, assigneeId, teamId, dueDate } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const oldStatus = task.status;

    // Authorization: admin can always update
    const isAdmin = userRole === 'admin';
    const isAssignee = task.assigneeId === userId;
    const isInternalAssignee = task.internalAssigneeId === userId;
    
    // Check if user is a team lead for this task's team
    let isTeamLead = false;
    if (task.teamId) {
      const teamMember = await TeamMember.findOne({
        where: { teamId: task.teamId, userId },
      });
      if (teamMember && teamMember.role === 'lead') {
        isTeamLead = true;
      }
    }

    if (!isAdmin && !isAssignee && !isTeamLead && !isInternalAssignee) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this task',
      });
    }

    // Members can only update status and priority of their tasks
    if (!isAdmin && !isTeamLead && (isAssignee || isInternalAssignee)) {
      if (title || description || assigneeId || teamId || dueDate) {
        return res.status(403).json({
          success: false,
          error: 'Members can only update task status and priority',
        });
      }

      // Industry Level: Members cannot mark tasks as 'done' directly
      // They must submit for 'in-review'
      if (status === 'done' && oldStatus !== 'done') {
        return res.status(403).json({
          success: false,
          error: 'Tasks must be reviewed by a Team Lead or Admin before being marked as Done',
        });
      }
    }

    // Only Admin or Lead can approve from 'in-review' to 'done'
    if (status === 'done' && oldStatus === 'in-review' && !isAdmin && !isTeamLead) {
      return res.status(403).json({
        success: false,
        error: 'Only a Team Lead or Admin can approve tasks',
      });
    }

    const oldPriority = task.priority;

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (teamId !== undefined) task.teamId = teamId;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    // Create activity logs for important changes
    if (status && status !== oldStatus) {
      await TaskActivity.create({
        taskId: id,
        userId,
        type: 'status_change',
        oldValue: oldStatus,
        newValue: status,
        description: `Changed status from ${oldStatus} to ${status}`,
      });

      // Notify relevant parties about status change
      if (status === 'in-review' && task.teamId) {
        // Notify Team Leads
        const leads = await TeamMember.findAll({
          where: { teamId: task.teamId, role: 'lead' }
        });
        for (const lead of leads) {
          await createNotification({
            userId: lead.userId,
            type: 'review_requested',
            title: 'Task Review Requested',
            message: `A task needs your review: ${task.title}`,
            relatedId: task.id
          });
        }
      } else if (status === 'done' && oldStatus === 'in-review' && task.assigneeId) {
        // Notify Assignee that work was approved
        await createNotification({
          userId: task.assigneeId,
          type: 'review_approved',
          title: 'Work Approved!',
          message: `Your work on "${task.title}" has been approved and completed.`,
          relatedId: task.id
        });
      }
    }

    if (priority && priority !== oldPriority) {
      await TaskActivity.create({
        taskId: id,
        userId,
        type: 'priority_change',
        oldValue: oldPriority,
        newValue: priority,
        description: `Changed priority from ${oldPriority} to ${priority}`,
      });
    }

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
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('CRITICAL UPDATE TASK ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update task',
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

/**
 * PATCH /api/tasks/:id/delegate
 * Delegate a team task to a specific team member (Team Lead only)
 */
export const delegateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { internalAssigneeId } = req.body;
    const userId = req.userId;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    if (task.taskType !== 'team') {
      return res.status(400).json({ success: false, error: 'Only team tasks can be delegated internally' });
    }

    // Authorization: Check if user is the Team Lead of the task's team
    const teamMember = await TeamMember.findOne({
      where: { teamId: task.teamId, userId: userId, role: 'lead' }
    });

    if (!teamMember && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only Team Leads or Admins can delegate team tasks' });
    }

    // Update the internal assignee
    const oldInternalAssigneeId = task.internalAssigneeId;
    task.internalAssigneeId = internalAssigneeId;
    task.delegatedBy = userId;
    await task.save();

    // Create activity log
    await TaskActivity.create({
      taskId: id,
      userId,
      type: 'delegation',
      oldValue: oldInternalAssigneeId,
      newValue: internalAssigneeId,
      description: `Task delegated internally to ${internalAssigneeId}`,
    });

    // Notify the internal assignee
    if (internalAssigneeId) {
      await createNotification({
        userId: internalAssigneeId,
        type: 'task_delegated',
        title: 'Task Delegated to You',
        message: `Your Team Lead delegated a task to you: ${task.title}`,
        relatedId: task.id
      });
    }

    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'internalAssignee', attributes: ['id', 'name', 'avatar'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'icon', 'color'] },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task delegated successfully'
    });
  } catch (error) {
    console.error('Delegate task error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delegate task' });
  }
};


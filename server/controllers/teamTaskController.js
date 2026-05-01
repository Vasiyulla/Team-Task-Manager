import { Task, User, Project, Team, TeamMember, TaskAssignment, TaskActivity } from '../models/index.js';
import { createNotification } from '../utils/notifications.js';
import { Op } from 'sequelize';

/**
 * POST /api/tasks/individual
 * Create and assign individual task to a member
 * Only admins or project owners can create tasks
 */
export const createIndividualTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, assigneeId, dueDate } = req.body;
    const userId = req.userId;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Verify assignee exists
    const assignee = await User.findByPk(assigneeId);
    if (!assignee) {
      return res.status(404).json({ success: false, error: 'Assignee not found' });
    }

    // Create individual task
    const task = await Task.create({
      title,
      description,
      projectId,
      priority: priority || 'medium',
      assigneeId,
      taskType: 'individual',
      dueDate: dueDate || null,
      requiresLeadApproval: false,
    });

    // Create task assignment record
    await TaskAssignment.create({
      taskId: task.id,
      assignedById: userId,
      assignmentType: 'initial',
      reason: description || `Assigned to ${assignee.name}`,
      status: 'active',
    });

    // Notify assignee
    await createNotification({
      userId: assigneeId,
      type: 'task_assigned',
      title: 'Task Assigned to You',
      message: `New task: ${title}`,
      relatedId: task.id,
    });

    // Record activity
    await TaskActivity.create({
      taskId: task.id,
      userId,
      action: 'assigned',
      changes: JSON.stringify({ assigneeId }),
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'title', 'color'] },
      ],
    });

    return res.status(201).json({
      success: true,
      data: taskWithDetails,
      message: 'Individual task created and assigned',
    });
  } catch (error) {
    console.error('Create individual task error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create task' });
  }
};

/**
 * POST /api/tasks/team
 * Create and assign team task to a team
 * Only admins can create team tasks
 */
export const createTeamTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, teamId, dueDate, requiresLeadApproval } = req.body;
    const userId = req.userId;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Verify team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Get team lead
    const teamLead = await User.findByPk(team.primaryLeadId);
    if (!teamLead) {
      return res.status(400).json({ success: false, error: 'Team has no primary lead assigned' });
    }

    // Create team task
    const task = await Task.create({
      title,
      description,
      projectId,
      priority: priority || 'medium',
      teamId,
      taskType: 'team',
      dueDate: dueDate || null,
      requiresLeadApproval: requiresLeadApproval || false,
    });

    // Create task assignment record
    await TaskAssignment.create({
      taskId: task.id,
      assignedById: userId,
      assignmentType: 'initial',
      teamLeadId: teamLead.id,
      reason: description || `Assigned to ${team.name}`,
      status: 'active',
    });

    // Notify team lead
    await createNotification({
      userId: teamLead.id,
      type: 'team_task_assigned',
      title: 'Team Task Assigned',
      message: `Your team "${team.name}" has been assigned: ${title}`,
      relatedId: task.id,
    });

    // Notify all team members
    const teamMembers = await TeamMember.findAll({ where: { teamId } });
    for (const member of teamMembers) {
      if (member.userId !== teamLead.id) {
        await createNotification({
          userId: member.userId,
          type: 'team_task_info',
          title: 'Team Task Available',
          message: `Team task: ${title}`,
          relatedId: task.id,
        });
      }
    }

    // Record activity
    await TaskActivity.create({
      taskId: task.id,
      userId,
      action: 'assigned',
      changes: JSON.stringify({ teamId, taskType: 'team' }),
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name', 'icon', 'color'] },
        { model: Project, as: 'project', attributes: ['id', 'title', 'color'] },
      ],
    });

    return res.status(201).json({
      success: true,
      data: taskWithDetails,
      message: 'Team task created and assigned',
    });
  } catch (error) {
    console.error('Create team task error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create team task' });
  }
};

/**
 * POST /api/tasks/:taskId/delegate
 * Team lead delegates a team task to a team member
 * Only the team lead can delegate
 */
export const delegateTeamTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { internalAssigneeId } = req.body;
    const userId = req.userId;

    // Get task
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Verify it's a team task
    if (task.taskType !== 'team') {
      return res.status(400).json({ success: false, error: 'Can only delegate team tasks' });
    }

    // Get team
    const team = await Team.findByPk(task.teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Verify requester is team lead
    if (team.primaryLeadId !== userId) {
      return res.status(403).json({ success: false, error: 'Only team lead can delegate tasks' });
    }

    // Verify internal assignee is team member
    const teamMember = await TeamMember.findOne({
      where: { teamId: task.teamId, userId: internalAssigneeId },
    });
    if (!teamMember) {
      return res.status(400).json({ success: false, error: 'User is not a team member' });
    }

    // Update task
    task.internalAssigneeId = internalAssigneeId;
    task.delegatedBy = userId;
    await task.save();

    // Create assignment record
    await TaskAssignment.create({
      taskId: task.id,
      assignedById: userId,
      assignmentType: 'delegation',
      teamLeadId: userId,
      internalAssigneeId,
      reason: `Delegated by team lead ${(await User.findByPk(userId)).name}`,
      status: 'active',
    });

    // Get assignee
    const assignee = await User.findByPk(internalAssigneeId);

    // Notify delegated member
    await createNotification({
      userId: internalAssigneeId,
      type: 'task_delegated',
      title: 'Task Delegated to You',
      message: `${team.name} lead assigned you: ${task.title}`,
      relatedId: task.id,
    });

    // Record activity
    await TaskActivity.create({
      taskId: task.id,
      userId,
      action: 'delegated',
      changes: JSON.stringify({ delegatedTo: internalAssigneeId }),
    });

    const updatedTask = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'internalAssignee', attributes: ['id', 'name', 'avatar', 'email'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'icon'] },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: `Task delegated to ${assignee.name}`,
    });
  } catch (error) {
    console.error('Delegate team task error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delegate task' });
  }
};

/**
 * GET /api/tasks/my-tasks
 * Get all tasks assigned to the current user (individual tasks)
 */
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, priority } = req.query;

    const where = {
      [Op.or]: [
        { assigneeId: userId, taskType: 'individual' },
        { internalAssigneeId: userId, taskType: 'team' },
      ],
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'internalAssignee', attributes: ['id', 'name', 'avatar'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'icon', 'color'] },
        { model: Project, as: 'project', attributes: ['id', 'title', 'color'] },
      ],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: 'Your tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
  }
};

/**
 * GET /api/tasks/team/:teamId
 * Get all team tasks assigned to a team
 * Only team lead can view
 */
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    // Get team
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Verify requester is team lead or admin
    if (team.primaryLeadId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only team lead can view team tasks' });
    }

    const tasks = await Task.findAll({
      where: { teamId, taskType: 'team' },
      include: [
        { model: User, as: 'internalAssignee', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'delegatedByUser', attributes: ['id', 'name'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'icon', 'color'] },
        { model: Project, as: 'project', attributes: ['id', 'title', 'color'] },
        {
          model: TaskAssignment,
          as: 'assignments',
          attributes: ['id', 'assignmentType', 'reason', 'createdAt'],
          include: [{ model: User, as: 'assignedBy', attributes: ['id', 'name'] }],
        },
      ],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: 'Team tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Get team tasks error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve team tasks' });
  }
};

/**
 * GET /api/tasks/:taskId/history
 * Get full assignment and delegation history
 */
export const getTaskAssignmentHistory = async (req, res) => {
  try {
    const { taskId } = req.params;

    const assignments = await TaskAssignment.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'assignedBy', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'teamLead', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'internalAssignee', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: assignments,
      message: 'Assignment history retrieved',
    });
  } catch (error) {
    console.error('Get assignment history error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve history' });
  }
};

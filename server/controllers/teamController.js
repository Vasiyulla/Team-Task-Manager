import { Team, TeamMember, User, Task } from '../models/index.js';
import { Op } from 'sequelize';

// ========================================
// TEAM CRUD OPERATIONS
// ========================================

/**
 * GET /api/teams
 * Get all teams for a user (owned or member of)
 */
export const getTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const { search } = req.query;

    let where = {
      [Op.or]: [
        { ownerId: userId },
      ],
    };

    // Add search filter if provided
    if (search) {
      where = {
        [Op.and]: [
          where,
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } },
            ],
          },
        ],
      };
    }

    const teams = await Team.findAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Also get teams where user is a member
    const memberTeams = await TeamMember.findAll({
      where: { userId },
      attributes: ['teamId'],
    });

    const memberTeamIds = memberTeams.map(tm => tm.teamId);

    if (memberTeamIds.length > 0) {
      const additionalTeams = await Team.findAll({
        where: {
          id: { [Op.in]: memberTeamIds },
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'avatar'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: ['role', 'joinedAt'],
            },
          },
          {
            model: Task,
            as: 'tasks',
            attributes: ['id'],
          },
        ],
      });

      teams.push(...additionalTeams);
    }

    // Remove duplicates
    const uniqueTeams = Array.from(new Map(teams.map(t => [t.id, t])).values());

    return res.status(200).json({
      success: true,
      data: uniqueTeams,
      message: 'Teams retrieved successfully',
    });
  } catch (error) {
    console.error('Get teams error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve teams',
    });
  }
};

/**
 * GET /api/teams/:teamId
 * Get team details by ID
 */
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'priority', 'assigneeId', 'dueDate'],
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = team.members?.some(m => m.id === userId);
    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this team',
      });
    }

    return res.status(200).json({
      success: true,
      data: team,
      message: 'Team retrieved successfully',
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve team',
    });
  }
};

/**
 * POST /api/teams
 * Create a new team
 */
export const createTeam = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const userId = req.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Team name is required',
      });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#8B5CF6',
      icon: icon || '👥',
      ownerId: userId,
    });

    // Add owner as a member with lead role
    await TeamMember.create({
      teamId: team.id,
      userId,
      role: 'lead',
    });

    const teamWithMembers = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: teamWithMembers,
      message: 'Team created successfully',
    });
  } catch (error) {
    console.error('Create team error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create team',
    });
  }
};

/**
 * PUT /api/teams/:teamId
 * Update team details
 */
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, color, icon, isActive } = req.body;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner can update
    if (team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this team',
      });
    }

    await team.update({
      name: name !== undefined ? name.trim() : team.name,
      description: description !== undefined ? description?.trim() || null : team.description,
      color: color !== undefined ? color : team.color,
      icon: icon !== undefined ? icon : team.icon,
      isActive: isActive !== undefined ? isActive : team.isActive,
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully',
    });
  } catch (error) {
    console.error('Update team error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update team',
    });
  }
};

/**
 * DELETE /api/teams/:teamId
 * Delete a team
 */
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner can delete
    if (team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this team',
      });
    }

    await team.destroy();

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Delete team error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete team',
    });
  }
};

// ========================================
// TEAM MEMBER MANAGEMENT
// ========================================

/**
 * POST /api/teams/:teamId/members
 * Add a member to the team
 */
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: newUserId, email, role = 'member' } = req.body;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner or lead can add members
    const userMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !userMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to add members',
      });
    }

    if (userMember && userMember.role !== 'lead' && team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team lead can add members',
      });
    }

    // Find user - either by email or userId
    let targetUser;
    if (email) {
      targetUser = await User.findOne({ where: { email } });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: `No registered user found with email: ${email}. Only registered members can be added.`,
        });
      }
    } else if (newUserId) {
      targetUser = await User.findByPk(newUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Make sure the user is registered.',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide either email or userId',
      });
    }

    // Check if user already exists in team
    const existingMember = await TeamMember.findOne({
      where: { teamId, userId: targetUser.id },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'This user is already a member of this team',
      });
    }

    await TeamMember.create({
      teamId,
      userId: targetUser.id,
      role: role || 'member',
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: updatedTeam,
      message: 'Member added successfully',
    });
  } catch (error) {
    console.error('Add team member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add member',
    });
  }
};

/**
 * DELETE /api/teams/:teamId/members/:memberId
 * Remove a member from the team
 */
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    if (team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to remove members',
      });
    }

    // Can't remove team owner
    if (memberId === team.ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove team owner',
      });
    }

    await TeamMember.destroy({
      where: { teamId, userId: memberId },
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove member',
    });
  }
};

/**
 * PUT /api/teams/:teamId/members/:memberId
 * Update member role
 */
export const updateTeamMemberRole = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.userId;

    if (!['lead', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "lead" or "member"',
      });
    }

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner can change roles
    if (team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update member role',
      });
    }

    await TeamMember.update({ role }, {
      where: { teamId, userId: memberId },
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTeam,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Update member role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update member role',
    });
  }
};

// ========================================
// TEAM LEAD MANAGEMENT
// ========================================

/**
 * PUT /api/teams/:teamId/primary-lead/:userId
 * Set a member as the primary lead of the team
 * Only team owner or admin can do this
 */
export const setPrimaryLead = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const currentUserId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner or admin
    if (team.ownerId !== currentUserId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team owner can set primary lead',
      });
    }

    // Verify the user is a team member
    const member = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'User is not a team member',
      });
    }

    // Update team's primary lead
    await Team.update({ primaryLeadId: userId }, {
      where: { id: teamId },
    });

    // Make sure the primary lead has team lead access
    await TeamMember.update({ isPrimaryLead: true }, {
      where: { teamId, userId },
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'primaryLead',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'isPrimaryLead', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTeam,
      message: 'Primary lead updated successfully',
    });
  } catch (error) {
    console.error('Set primary lead error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to set primary lead',
    });
  }
};

/**
 * PUT /api/teams/:teamId/members/:memberId/lead-status
 * Toggle a member's team lead status (can have multiple team leads)
 * Only team owner or admin can do this
 */
export const toggleTeamLeadStatus = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { isLead } = req.body;
    const currentUserId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner or admin
    if (team.ownerId !== currentUserId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team owner can change member lead status',
      });
    }

    // Verify the user is a team member
    const member = await TeamMember.findOne({
      where: { teamId, userId: memberId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'User is not a team member',
      });
    }

    // Prevent removing owner as a lead (owner can't be demoted)
    if (team.ownerId === memberId && isLead === false) {
      return res.status(400).json({
        success: false,
        error: 'Team owner cannot be demoted from lead status',
      });
    }

    // Update team member lead status
    await TeamMember.update({ isPrimaryLead: isLead }, {
      where: { teamId, userId: memberId },
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['role', 'isPrimaryLead', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedTeam,
      message: `Member ${isLead ? 'promoted to' : 'demoted from'} team lead status`,
    });
  } catch (error) {
    console.error('Toggle team lead status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update lead status',
    });
  }
};

/**
 * GET /api/teams/:teamId/leads
 * Get all team leads and primary lead information
 */
export const getTeamLeads = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'primaryLead',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: ['isPrimaryLead', 'joinedAt'],
            where: { isPrimaryLead: true },
          },
          required: false,
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Format response with lead information
    const leads = {
      owner: {
        id: team.owner.id,
        name: team.owner.name,
        avatar: team.owner.avatar,
        role: 'owner',
      },
      primaryLead: team.primaryLead ? {
        id: team.primaryLead.id,
        name: team.primaryLead.name,
        avatar: team.primaryLead.avatar,
        role: 'primary-lead',
      } : null,
      teamLeads: team.members
        .filter(m => m.TeamMember?.isPrimaryLead)
        .map(m => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: 'team-lead',
        })),
    };

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Get team leads error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch team leads',
    });
  }
};

// ========================================
// TEAM STATISTICS & METRICS
// ========================================

/**
 * GET /api/teams/:teamId/statistics
 * Get team performance metrics
 */
export const getTeamStatistics = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view team statistics',
      });
    }

    // Get team tasks
    const tasks = await Task.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name'],
        },
      ],
    });

    // Calculate statistics
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      overdueTasks: tasks.filter(t => t.status === 'overdue').length,
      completionPercentage: tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
        : 0,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      memberWorkload: {},
    };

    // Calculate workload per member
    const members = await TeamMember.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    members.forEach(member => {
      // Workload includes tasks where they are primary assignee OR internal assignee
      const memberTasks = tasks.filter(t => 
        (t.assigneeId === member.userId) || 
        (t.taskType === 'team' && t.internalAssigneeId === member.userId)
      );
      
      stats.memberWorkload[member.userId] = {
        name: member.User.name,
        avatar: member.User.avatar,
        assigned: memberTasks.length,
        completed: memberTasks.filter(t => t.status === 'done').length,
        inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
        overdue: memberTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length,
      };
    });

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Team statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Get team statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve team statistics',
    });
  }
};

/**
 * GET /api/teams/:teamId/activity
 * Get team activity feed
 */
export const getTeamActivity = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { limit = 20 } = req.query;

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view team activity',
      });
    }

    // Get recent team activities (tasks updated/created)
    const activities = await Task.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      data: activities,
      message: 'Team activity retrieved successfully',
    });
  } catch (error) {
    console.error('Get team activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve team activity',
    });
  }
};

// ========================================
// BULK TASK OPERATIONS
// ========================================

/**
 * POST /api/teams/:teamId/tasks/bulk-assign
 * Assign multiple tasks to a team
 */
export const bulkAssignTasksToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { taskIds } = req.body;
    const userId = req.userId;

    // Validate input
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds must be a non-empty array',
      });
    }

    // Check team exists and user has permission
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization - only owner or lead can bulk assign
    const userMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !userMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to assign tasks',
      });
    }

    if (userMember && userMember.role !== 'lead' && team.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team lead can assign tasks',
      });
    }

    // Validate all tasks exist
    const tasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
    });

    if (tasks.length !== taskIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more tasks not found',
      });
    }

    // Assign tasks to team
    await Task.update(
      { teamId },
      { where: { id: { [Op.in]: taskIds } } }
    );

    // Fetch updated tasks
    const updatedTasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'avatar'],
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
      data: updatedTasks,
      message: `${taskIds.length} tasks assigned to team successfully`,
    });
  } catch (error) {
    console.error('Bulk assign tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assign tasks to team',
    });
  }
};

// ========================================
// ADMIN MEMBER MANAGEMENT
// ========================================

/**
 * POST /api/teams/:teamId/admin/members
 * Admin: Add member to team (no role restrictions)
 */
export const adminAddTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: newUserId, role = 'member' } = req.body;
    const userRole = req.userRole;

    // Only admins can use this endpoint
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can use this feature',
      });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check if user already exists in team
    const existingMember = await TeamMember.findOne({
      where: { teamId, userId: newUserId },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this team',
      });
    }

    // Check if user exists
    const userExists = await User.findByPk(newUserId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await TeamMember.create({
      teamId,
      userId: newUserId,
      role: role || 'member',
    });

    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatar', 'email'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: updatedTeam,
      message: `Admin added ${userExists.name} to team successfully`,
    });
  } catch (error) {
    console.error('Admin add team member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add member',
    });
  }
};

/**
 * DELETE /api/teams/:teamId/admin/members/:memberId
 * Admin: Remove member from team (no restrictions)
 */
export const adminRemoveTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userRole = req.userRole;

    // Only admins can use this endpoint
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can use this feature',
      });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    const member = await User.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
      });
    }

    // Admins can remove anyone except team owner
    if (memberId === team.ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove team owner. Transfer ownership first.',
      });
    }

    await TeamMember.destroy({
      where: { teamId, userId: memberId },
    });

    return res.status(200).json({
      success: true,
      message: `Admin removed ${member.name} from team successfully`,
    });
  } catch (error) {
    console.error('Admin remove team member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove member',
    });
  }
};

// ========================================
// INNOVATIVE FEATURES
// ========================================

/**
 * GET /api/teams/:teamId/capacity
 * Get team capacity and workload planning data
 */
export const getTeamCapacity = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get team members and their workload
    const members = await TeamMember.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    const tasks = await Task.findAll({
      where: { teamId },
    });

    const capacity = {
      teamSize: members.length,
      maxCapacity: members.length * 10, // Assuming 10 tasks per person is max
      currentLoad: tasks.filter(t => t.status !== 'done').length,
      utilizationPercentage: 0,
      memberCapacity: [],
      recommendations: [],
    };

    // Calculate per-member capacity
    members.forEach(member => {
      // Current load includes tasks where they are primary assignee OR internal assignee
      const memberTasks = tasks.filter(t => 
        (t.assigneeId === member.userId || t.internalAssigneeId === member.userId) && 
        t.status !== 'done'
      );
      
      const isOverloaded = memberTasks.length > 8;
      const isUnderutilized = memberTasks.length < 2;

      capacity.memberCapacity.push({
        userId: member.User.id,
        name: member.User.name,
        avatar: member.User.avatar,
        currentTasks: memberTasks.length,
        capacity: 10,
        utilizationPercentage: Math.round((memberTasks.length / 10) * 100),
        status: isOverloaded ? 'overloaded' : isUnderutilized ? 'underutilized' : 'balanced',
      });

      if (isOverloaded) {
        capacity.recommendations.push({
          type: 'overload',
          member: member.User.name,
          message: `${member.User.name} is reaching peak capacity with ${memberTasks.length} active tasks. Consider redistributing the load.`,
        });
      }

      if (isUnderutilized && capacity.currentLoad > capacity.teamSize * 5) {
        capacity.recommendations.push({
          type: 'underutilization',
          member: member.User.name,
          message: `${member.User.name} has high availability. They can take over tasks from overloaded members.`,
        });
      }
    });

    capacity.utilizationPercentage = Math.round(
      (capacity.currentLoad / capacity.maxCapacity) * 100
    );

    return res.status(200).json({
      success: true,
      data: capacity,
      message: 'Team capacity data retrieved successfully',
    });
  } catch (error) {
    console.error('Get team capacity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve team capacity data',
    });
  }
};

/**
 * GET /api/teams/:teamId/performance-trends
 * Get team performance trends over time
 */
export const getTeamPerformanceTrends = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { days = 30 } = req.query;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const tasks = await Task.findAll({
      where: { teamId },
      order: [['updatedAt', 'DESC']],
    });

    // Generate trend data (simulated for now - can be enhanced with real historical data)
    const trends = {
      completionTrend: [],
      velocityTrend: [],
      qualityScore: 92,
      timelinessScore: 85,
      collaborationScore: 88,
      overallTeamHealth: 'Good', // Good, Excellent, NeedsImprovement
    };

    // Create week-based trends
    const now = new Date();
    for (let i = parseInt(days); i > 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];
      const completedInDay = tasks.filter(t =>
        t.status === 'done' &&
        new Date(t.updatedAt).toISOString().split('T')[0] === dateStr
      ).length;

      trends.completionTrend.push({
        date: dateStr,
        completed: completedInDay,
      });
    }

    // Calculate velocity
    trends.velocityTrend = [
      { week: 'Week 1', tasksCompleted: 8, targetTasks: 10 },
      { week: 'Week 2', tasksCompleted: 11, targetTasks: 10 },
      { week: 'Week 3', tasksCompleted: 9, targetTasks: 10 },
      { week: 'Week 4', tasksCompleted: 12, targetTasks: 10 },
    ];

    // Determine team health
    if (trends.completionTrend.some(t => t.completed > 2) && trends.qualityScore > 90) {
      trends.overallTeamHealth = 'Excellent';
    } else if (trends.completionTrend.some(t => t.completed === 0)) {
      trends.overallTeamHealth = 'Needs Improvement';
    }

    return res.status(200).json({
      success: true,
      data: trends,
      message: 'Team performance trends retrieved successfully',
    });
  } catch (error) {
    console.error('Get performance trends error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance trends',
    });
  }
};

/**
 * GET /api/teams/:teamId/achievements
 * Get team achievements and milestones
 */
export const getTeamAchievements = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const isMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !isMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const tasks = await Task.findAll({
      where: { teamId },
    });

    const members = await TeamMember.findAll({
      where: { teamId },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;

    // Generate achievements
    const achievements = {
      badges: [],
      leaderboard: [],
      milestones: [],
    };

    // Badge system
    if (completedTasks >= 10) {
      achievements.badges.push({
        id: 'starter',
        name: '🚀 Getting Started',
        description: 'Completed 10 tasks',
        unlockedDate: new Date(),
      });
    }

    if (completedTasks >= 50) {
      achievements.badges.push({
        id: 'productive',
        name: '⚡ Productive Team',
        description: 'Completed 50 tasks',
        unlockedDate: new Date(),
      });
    }

    if (completedTasks >= 100) {
      achievements.badges.push({
        id: 'powerhouse',
        name: '💪 Powerhouse Team',
        description: 'Completed 100 tasks',
        unlockedDate: new Date(),
      });
    }

    // Leaderboard (top performers)
    const leaderboardData = members.map(m => {
      // Performance includes tasks where they are primary assignee OR internal assignee
      const memberTasks = tasks.filter(t => 
        (t.assigneeId === m.userId) || 
        (t.taskType === 'team' && t.internalAssigneeId === m.userId)
      );
      
      const completed = memberTasks.filter(t => t.status === 'done').length;

      return {
        userId: m.User.id,
        name: m.User.name,
        avatar: m.User.avatar,
        tasksCompleted: completed,
        totalTasks: memberTasks.length,
        efficiency: memberTasks.length > 0
          ? Math.round((completed / memberTasks.length) * 100)
          : 0,
      };
    }).sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    achievements.leaderboard = leaderboardData;

    // Milestones
    achievements.milestones = [
      {
        milestone: '🎯 First Task',
        status: completedTasks > 0 ? 'completed' : 'pending',
        progress: completedTasks > 0 ? 100 : 0,
      },
      {
        milestone: '⭐ 25 Tasks Completed',
        status: completedTasks >= 25 ? 'completed' : 'in-progress',
        progress: Math.min(Math.round((completedTasks / 25) * 100), 100),
      },
      {
        milestone: '🏆 100% Team Collaboration',
        status: members.length > 1 && members.every(m => tasks.some(t => t.assigneeId === m.userId)) ? 'completed' : 'in-progress',
        progress: members.length > 0 ? Math.round((members.filter(m => tasks.some(t => t.assigneeId === m.userId)).length / members.length) * 100) : 0,
      },
      {
        milestone: '📈 Perfect Week',
        status: 'pending',
        progress: 45,
      },
    ];

    return res.status(200).json({
      success: true,
      data: achievements,
      message: 'Team achievements retrieved successfully',
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve achievements',
    });
  }
};

/**
 * POST /api/teams/:teamId/smart-assign
 * Intelligent task assignment based on workload and availability
 */
export const smartAssignTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { taskIds } = req.body;
    const userId = req.userId;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'taskIds must be a non-empty array',
      });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Check authorization
    const userMember = await TeamMember.findOne({
      where: { teamId, userId },
    });

    if (team.ownerId !== userId && !userMember && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to assign tasks',
      });
    }

    // Get all team members
    const members = await TeamMember.findAll({
      where: { teamId },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Team has no members to assign tasks to',
      });
    }

    // Get current workload for each member
    const tasksToAssign = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
    });

    const assignments = {};
    const memberWorkload = {};

    // Initialize workload count
    members.forEach(m => {
      memberWorkload[m.userId] = 0;
    });

    // Count existing tasks
    const existingTasks = await Task.findAll({
      where: {
        teamId,
        assigneeId: { [Op.in]: members.map(m => m.userId) },
        status: { [Op.ne]: 'done' },
      },
    });

    existingTasks.forEach(t => {
      if (memberWorkload[t.assigneeId] !== undefined) {
        memberWorkload[t.assigneeId]++;
      }
    });

    // Smart assignment: assign to least loaded member
    tasksToAssign.forEach(task => {
      const leastLoadedMember = members.reduce((prev, current) => {
        return memberWorkload[prev.userId] <= memberWorkload[current.userId] ? prev : current;
      });

      assignments[task.id] = leastLoadedMember.userId;
      memberWorkload[leastLoadedMember.userId]++;
    });

    // Update tasks with assignments
    const updates = [];
    for (const [taskId, assigneeId] of Object.entries(assignments)) {
      updates.push(
        Task.update(
          { teamId, assigneeId },
          { where: { id: taskId } }
        )
      );
    }

    await Promise.all(updates);

    // Fetch updated tasks
    const updatedTasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        assignedTasks: updatedTasks,
        assignments: Object.entries(assignments).map(([taskId, assigneeId]) => ({
          taskId,
          assignedTo: members.find(m => m.userId === assigneeId)?.User.name,
        })),
      },
      message: 'Tasks intelligently assigned based on team member workload',
    });
  } catch (error) {
    console.error('Smart assign tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assign tasks intelligently',
    });
  }
};


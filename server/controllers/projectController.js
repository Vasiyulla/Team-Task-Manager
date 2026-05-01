import { Project, ProjectMember, User, Task } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * GET /api/projects
 * Get all projects where user is a member or owner
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.userId;

    // Get projects where user is owner
    const ownedProjects = await Project.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    // Get projects where user is member
    const memberProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: userId },
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
    });

    // Combine and deduplicate
    const allProjects = [...ownedProjects, ...memberProjects];
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p.id, p])).values()
    );

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      uniqueProjects.map(async (project) => {
        const taskCount = await Task.count({
          where: { projectId: project.id },
        });
        const completedCount = await Task.count({
          where: { projectId: project.id, status: 'done' },
        });
        return {
          ...project.toJSON(),
          taskCount,
          completedCount,
          progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: projectsWithCounts,
      message: 'Projects retrieved successfully',
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve projects',
    });
  }
};

/**
 * POST /api/projects
 * Create a new project (admin only)
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const userId = req.userId;

    const project = await Project.create({
      title,
      description,
      color: color || '#6366F1',
      ownerId: userId,
    });

    // Add creator as member
    await ProjectMember.create({
      projectId: project.id,
      userId: userId,
    });

    const projectWithDetails = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: projectWithDetails,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
};

/**
 * GET /api/projects/:id
 * Get a specific project
 */
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          through: { attributes: ['joinedAt'] },
          attributes: ['id', 'name', 'email', 'avatar', 'role'],
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

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Check membership
    const isMember = project.members.some(m => m.id === userId);
    const isOwner = project.ownerId === userId;

    if (!isMember && !isOwner && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this project',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
      message: 'Project retrieved successfully',
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project',
    });
  }
};

/**
 * PATCH /api/projects/:id
 * Update a project (admin only)
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, color } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (color) project.color = color;

    await project.save();

    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete a project (admin only)
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    await project.destroy();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
};

/**
 * POST /api/projects/:id/invite
 * Invite a member to project (admin only)
 */
export const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already member
    const existingMember = await ProjectMember.findOne({
      where: { projectId: id, userId: user.id },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: 'User is already a member of this project',
      });
    }

    // Add member
    await ProjectMember.create({
      projectId: id,
      userId: user.id,
    });

    const members = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: members,
      message: 'Member added successfully',
    });
  } catch (error) {
    console.error('Invite member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to invite member',
    });
  }
};

/**
 * GET /api/projects/:id/members
 * Get all members of a project
 */
export const getMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          through: { attributes: ['joinedAt'] },
          attributes: ['id', 'name', 'email', 'avatar', 'role'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar', 'role'],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Combine owner and members
    let allMembers = [...project.members];
    if (project.owner && !allMembers.find(m => m.id === project.owner.id)) {
      allMembers.unshift(project.owner);
    }

    // Get task load for each member
    const membersWithLoad = await Promise.all(
      allMembers.map(async (member) => {
        const taskCount = await Task.count({
          where: { projectId: id, assigneeId: member.id },
        });
        return {
          ...member.toJSON(),
          taskLoad: taskCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: membersWithLoad,
      message: 'Members retrieved successfully',
    });
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve members',
    });
  }
};

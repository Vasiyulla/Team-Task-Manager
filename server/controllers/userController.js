import { User, Task, ProjectMember, Project } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';

/**
 * GET /api/users/me
 * Get current user's profile
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User profile retrieved successfully',
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
    });
  }
};

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, avatar } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if new email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use',
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
};

/**
 * GET /api/users
 * Get all users (admin only) - for task assignment picker
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
    });
  }
};

/**
 * GET /api/users/:id/workload
 * Get user's workload (admin only)
 */
export const getUserWorkload = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const totalTasks = await Task.count({
      where: { assigneeId: id },
    });

    const completedTasks = await Task.count({
      where: { assigneeId: id, status: 'done' },
    });

    const inProgressTasks = await Task.count({
      where: { assigneeId: id, status: 'in-progress' },
    });

    const overdueTasks = await Task.count({
      where: { assigneeId: id, status: 'overdue' },
    });

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        workload: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
        },
      },
      message: 'User workload retrieved successfully',
    });
  } catch (error) {
    console.error('Get workload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve workload',
    });
  }
};

/**
 * GET /api/users/:id/projects
 * Get projects for a user
 */
export const getUserProjects = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get owned projects
    const ownedProjects = await Project.findAll({
      where: { ownerId: id },
    });

    // Get member projects
    const memberProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id },
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        owned: ownedProjects,
        member: memberProjects,
      },
      message: 'User projects retrieved successfully',
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user projects',
    });
  }
};

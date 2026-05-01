import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'in-review', 'done', 'overdue'),
    defaultValue: 'todo',
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  taskType: {
    type: DataTypes.ENUM('individual', 'team'),
    defaultValue: 'individual',
    allowNull: false,
  },
  internalAssigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'For team tasks: internal delegation to team member by lead',
  },
  requiresLeadApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, team lead must approve completion',
  },
  delegatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'Team lead who delegated this task internally',
  },
  dependsOnTaskId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['assigneeId'] },
    { fields: ['teamId'] },
    { fields: ['taskType'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['dueDate'] },
    { fields: ['internalAssigneeId'] },
    { fields: ['delegatedBy'] },
  ],
  hooks: {
    beforeCreate: (task) => {
      // Validate: Either assigneeId OR teamId, not both, not neither
      if (task.taskType === 'individual' && !task.assigneeId && !task.teamId) {
        throw new Error('Individual task must have assigneeId');
      }
      if (task.taskType === 'team' && !task.teamId) {
        throw new Error('Team task must have teamId');
      }
      // Relaxed validation to allow both teamId and assigneeId for enterprise model
      if (!task.assigneeId && !task.teamId) {
        throw new Error('Task must have either an assigneeId or a teamId');
      }
      // Only team tasks can have internal delegation
      if (task.taskType === 'individual' && task.internalAssigneeId) {
        throw new Error('Individual tasks cannot have internal assignees');
      }
    },
    beforeUpdate: (task) => {
      // Same validation on update
      if (task.taskType === 'individual' && !task.assigneeId && !task.teamId) {
        throw new Error('Individual task must have assigneeId');
      }
      if (task.taskType === 'team' && !task.teamId) {
        throw new Error('Team task must have teamId');
      }
      // Relaxed validation on update
      if (!task.assigneeId && !task.teamId) {
        throw new Error('Task must have either an assigneeId or a teamId');
      }
      if (task.taskType === 'individual' && task.internalAssigneeId) {
        throw new Error('Individual tasks cannot have internal assignees');
      }
    },
  },
});

export default Task;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TaskAssignment Model
 * Tracks the assignment history and delegation chain for tasks
 * Provides audit trail for team vs individual task assignments
 */
const TaskAssignment = sequelize.define('TaskAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  // Who made the assignment (admin or team lead)
  assignedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  // What type of assignment
  assignmentType: {
    type: DataTypes.ENUM('initial', 'delegation', 'reassignment'),
    defaultValue: 'initial',
  },
  // If team task, who is the team lead responsible
  teamLeadId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'Team lead responsible for team task',
  },
  // If delegation, who is the internal assignee
  internalAssigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: 'Team member internally assigned by lead',
  },
  // Reason for assignment/delegation
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Status of this assignment
  status: {
    type: DataTypes.ENUM('active', 'completed', 'replaced', 'cancelled'),
    defaultValue: 'active',
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
  tableName: 'task_assignments',
  timestamps: true,
  indexes: [
    { fields: ['taskId'] },
    { fields: ['assignedById'] },
    { fields: ['teamLeadId'] },
    { fields: ['internalAssigneeId'] },
    { fields: ['assignmentType'] },
    { fields: ['status'] },
  ],
});

export default TaskAssignment;

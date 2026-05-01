import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProjectMember = sequelize.define('ProjectMember', {
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    primaryKey: true,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'project_members',
  timestamps: false, // Only joinedAt, no updatedAt
  indexes: [
    { fields: ['projectId'] },
    { fields: ['userId'] },
  ],
});

export default ProjectMember;

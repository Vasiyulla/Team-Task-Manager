import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Project = sequelize.define('Project', {
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
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6366F1', // Default violet
    validate: {
      isHexColor(value) {
        if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
          throw new Error('Invalid hex color');
        }
      },
    },
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
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
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['createdAt'] },
  ],
});

// Associations will be set in a separate file
export default Project;

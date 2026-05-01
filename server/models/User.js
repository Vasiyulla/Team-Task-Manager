import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcryptjs from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null, // Will store initials or color code
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
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
  ],
});

// Instance methods
User.prototype.comparePassword = async function(plainPassword) {
  return bcryptjs.compare(plainPassword, this.passwordHash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

export default User;

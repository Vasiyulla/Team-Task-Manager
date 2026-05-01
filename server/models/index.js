import User from './User.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';
import Task from './Task.js';
import Comment from './Comment.js';

// ========================================
// Define Associations
// ========================================

// User associations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});

// Project associations
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'members',
});

// ProjectMember associations
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User, { foreignKey: 'userId' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });

// Comment associations
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Project, ProjectMember, Task, Comment };

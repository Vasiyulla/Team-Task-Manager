import User from './User.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';
import Task from './Task.js';
import Comment from './Comment.js';
import Team from './Team.js';
import TeamMember from './TeamMember.js';
import TaskActivity from './TaskActivity.js';
import TimeLog from './TimeLog.js';
import Notification from './Notification.js';
import TaskAssignment from './TaskAssignment.js';

// ========================================
// Define Associations
// ========================================

// User associations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Team, { foreignKey: 'ownerId', as: 'ownedTeams' });
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});
User.belongsToMany(Team, {
  through: TeamMember,
  foreignKey: 'userId',
  otherKey: 'teamId',
  as: 'teams',
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
Task.belongsTo(User, { foreignKey: 'internalAssigneeId', as: 'internalAssignee' });
Task.belongsTo(User, { foreignKey: 'delegatedBy', as: 'delegatedByUser' });
Task.belongsTo(Team, { foreignKey: 'teamId', as: 'team', allowNull: true });
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });
Task.belongsTo(Task, { foreignKey: 'dependsOnTaskId', as: 'dependency' });
Task.hasMany(Task, { foreignKey: 'dependsOnTaskId', as: 'dependents' });
Task.hasMany(TaskAssignment, { foreignKey: 'taskId', as: 'assignments', onDelete: 'CASCADE' });

// Comment associations
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team associations
Team.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Team.belongsTo(User, { foreignKey: 'primaryLeadId', as: 'primaryLead' });
Team.belongsToMany(User, {
  through: TeamMember,
  foreignKey: 'teamId',
  otherKey: 'userId',
  as: 'members',
});
Team.hasMany(Task, { foreignKey: 'teamId', as: 'tasks', onDelete: 'SET NULL' });

// TeamMember associations
TeamMember.belongsTo(Team, { foreignKey: 'teamId' });
TeamMember.belongsTo(User, { foreignKey: 'userId' });

// TaskActivity associations
TaskActivity.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Task.hasMany(TaskActivity, { foreignKey: 'taskId', as: 'activities', onDelete: 'CASCADE' });

// TimeLog associations
TimeLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Task.hasMany(TimeLog, { foreignKey: 'taskId', as: 'timeLogs', onDelete: 'CASCADE' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });

// TaskAssignment associations
TaskAssignment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskAssignment.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });
TaskAssignment.belongsTo(User, { foreignKey: 'teamLeadId', as: 'teamLead' });
TaskAssignment.belongsTo(User, { foreignKey: 'internalAssigneeId', as: 'internalAssignee' });
User.hasMany(TaskAssignment, { foreignKey: 'assignedById', as: 'assignmentsCreated' });
User.hasMany(TaskAssignment, { foreignKey: 'teamLeadId', as: 'leadAssignments' });
User.hasMany(TaskAssignment, { foreignKey: 'internalAssigneeId', as: 'internalAssignments' });

export { User, Project, ProjectMember, Task, Comment, Team, TeamMember, TaskActivity, TimeLog, Notification, TaskAssignment };

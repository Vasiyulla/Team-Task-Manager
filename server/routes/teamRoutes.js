import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  setPrimaryLead,
  toggleTeamLeadStatus,
  getTeamLeads,
  getTeamStatistics,
  getTeamActivity,
  bulkAssignTasksToTeam,
  adminAddTeamMember,
  adminRemoveTeamMember,
  getTeamCapacity,
  getTeamPerformanceTrends,
  getTeamAchievements,
  smartAssignTasks,
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all team routes with authentication
router.use(protect);

// Team CRUD operations
router.get('/', getTeams);
router.get('/:teamId', getTeamById);
router.post('/', createTeam);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);

// Team member management
router.post('/:teamId/members', addTeamMember);
router.delete('/:teamId/members/:memberId', removeTeamMember);
router.put('/:teamId/members/:memberId', updateTeamMemberRole);

// Team lead management
router.put('/:teamId/primary-lead/:userId', setPrimaryLead);
router.put('/:teamId/members/:memberId/lead-status', toggleTeamLeadStatus);
router.get('/:teamId/leads', getTeamLeads);

// Admin member management (admin only)
router.post('/:teamId/admin/members', adminAddTeamMember);
router.delete('/:teamId/admin/members/:memberId', adminRemoveTeamMember);

// Team statistics and activity
router.get('/:teamId/statistics', getTeamStatistics);
router.get('/:teamId/activity', getTeamActivity);

// Innovative features
router.get('/:teamId/capacity', getTeamCapacity);
router.get('/:teamId/performance-trends', getTeamPerformanceTrends);
router.get('/:teamId/achievements', getTeamAchievements);

// Bulk task operations
router.post('/:teamId/tasks/bulk-assign', bulkAssignTasksToTeam);
router.post('/:teamId/tasks/smart-assign', smartAssignTasks);

export default router;

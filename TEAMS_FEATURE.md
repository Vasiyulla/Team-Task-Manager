# 👥 Team Feature Documentation

## Overview

The Team feature allows users to organize work by creating teams and assigning tasks to them. Teams help organize members and tasks, enabling better collaboration and workload distribution.

## Key Features

### 1. **Team Management**
- Create new teams with custom names, descriptions, colors, and icons
- Edit team details (name, description, color)
- Delete teams
- Teams are owned by the creator
- Only team owner can delete a team

### 2. **Team Members**
- Add members to teams
- Remove members from teams
- Assign roles to members (Lead or Member)
- View all team members with their roles
- Members can be promoted to "Lead" role for additional permissions

### 3. **Task Assignment to Teams**
- Assign individual tasks to teams
- Bulk assign multiple tasks to a team
- Tasks can belong to both a project AND a team
- View all tasks assigned to a team

### 4. **Team Statistics & Metrics**
- Total tasks count
- Completed tasks count
- In-progress tasks count
- Overdue tasks count
- Overall completion percentage
- Member workload distribution
- Per-member task statistics

### 5. **Team Activity Feed**
- View recent team activities
- Track task updates within the team
- Monitor team progress

## API Endpoints

### Teams CRUD

#### Get All Teams
```
GET /api/teams
Query Params: search (optional)
Response: { success: true, data: Team[], message: string }
```

#### Get Team by ID
```
GET /api/teams/:teamId
Response: { success: true, data: Team, message: string }
```

#### Create Team
```
POST /api/teams
Body: {
  name: string (required),
  description: string (optional),
  color: string (hex color, optional),
  icon: string (emoji, optional)
}
Response: { success: true, data: Team, message: string }
```

#### Update Team
```
PUT /api/teams/:teamId
Body: {
  name: string (optional),
  description: string (optional),
  color: string (optional),
  icon: string (optional),
  isActive: boolean (optional)
}
Response: { success: true, data: Team, message: string }
```

#### Delete Team
```
DELETE /api/teams/:teamId
Response: { success: true, message: string }
```

### Team Members

#### Add Member to Team
```
POST /api/teams/:teamId/members
Body: {
  userId: string (required),
  role: 'lead' | 'member' (optional, default: 'member')
}
Response: { success: true, data: Team, message: string }
```

#### Remove Member from Team
```
DELETE /api/teams/:teamId/members/:memberId
Response: { success: true, message: string }
```

#### Update Member Role
```
PUT /api/teams/:teamId/members/:memberId
Body: {
  role: 'lead' | 'member' (required)
}
Response: { success: true, data: Team, message: string }
```

### Team Statistics & Activity

#### Get Team Statistics
```
GET /api/teams/:teamId/statistics
Response: { 
  success: true, 
  data: {
    totalTasks: number,
    completedTasks: number,
    inProgressTasks: number,
    todoTasks: number,
    overdueTasks: number,
    completionPercentage: number,
    highPriorityTasks: number,
    memberWorkload: { [userId]: { name, assigned, completed, inProgress } }
  },
  message: string 
}
```

#### Get Team Activity
```
GET /api/teams/:teamId/activity
Query Params: limit (default: 20)
Response: { success: true, data: Task[], message: string }
```

### Bulk Task Assignment

#### Assign Multiple Tasks to Team
```
POST /api/teams/:teamId/tasks/bulk-assign
Body: {
  taskIds: string[] (array of task IDs)
}
Response: { success: true, data: Task[], message: string }
```

## Frontend Components

### 1. **Teams Page** (`/teams`)
- View all user's teams
- Search teams by name or description
- Create new team button
- Team cards with quick stats
- Delete team functionality

### 2. **Team Detail Page** (`/teams/:teamId`)
- Team overview with icon, color, and description
- Four tabs:
  - **Overview**: Team details and settings
  - **Members**: View and manage team members
  - **Statistics**: Team performance metrics
  - **Tasks**: View tasks assigned to team
- Edit team information (owner only)
- Quick stats sidebar

### 3. **Create Team Modal** (`CreateTeamModal`)
- Form to create new team
- Input fields: name, description, color picker, icon selector
- 10 icon options to choose from
- Real-time color preview

### 4. **Team Members Panel** (`TeamMembersPanel`)
- List all team members with roles
- Add member by email
- Remove members (owner only)
- Change member roles (owner only)
- Shows member join dates

### 5. **Team Statistics** (`TeamStatistics`)
- Visual dashboard with task statistics
- Completion rate progress bar
- Member workload breakdown
- Individual member task counts

### 6. **Bulk Team Task Assign Modal** (`BulkTeamTaskAssignModal`)
- Select multiple tasks
- Assign all selected tasks to a team
- Checkbox for select/deselect all
- Shows task status badges

## Frontend API Client

```javascript
// teamClient.js exports

// Teams CRUD
getTeams(searchQuery)
getTeamById(teamId)
createTeam(teamData)
updateTeam(teamId, teamData)
deleteTeam(teamId)

// Team Members
addTeamMember(teamId, userId, role)
removeTeamMember(teamId, memberId)
updateTeamMemberRole(teamId, memberId, role)

// Statistics & Activity
getTeamStatistics(teamId)
getTeamActivity(teamId, limit)

// Bulk Operations
bulkAssignTasksToTeam(teamId, taskIds)
```

## Database Models

### Team
```javascript
{
  id: UUID (primary key),
  name: string (required),
  description: text (optional),
  color: string (hex color),
  icon: string (emoji),
  ownerId: UUID (foreign key to User),
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### TeamMember
```javascript
{
  id: UUID (primary key),
  teamId: UUID (foreign key to Team),
  userId: UUID (foreign key to User),
  role: ENUM('lead', 'member'),
  joinedAt: timestamp
}
```

### Task (Modified)
```javascript
{
  // ... existing fields
  teamId: UUID (optional, foreign key to Team)
}
```

## Usage Examples

### Creating a Team
1. Click "Create Team" button on Teams page
2. Fill in team name (required)
3. Add optional description
4. Select team color and icon
5. Click "Create Team"

### Adding Members
1. Go to team detail page
2. Click "Members" tab
3. Click "+ Add Member" button
4. Enter member email
5. Click "Add Member"

### Assigning Tasks to Team
1. Go to team detail page
2. Click "Tasks" tab
3. Tasks can be assigned from project view using "Bulk Team Task Assign Modal"
4. Or update individual tasks with `teamId`

### Viewing Team Statistics
1. Go to team detail page
2. Click "Statistics" tab
3. View completion rates and member workload

## Authorization & Permissions

| Action | Owner | Lead | Member | Admin |
|--------|-------|------|--------|-------|
| Create Team | ✅ | ✗ | ✗ | ✅ |
| Update Team | ✅ | ✗ | ✗ | ✅ |
| Delete Team | ✅ | ✗ | ✗ | ✅ |
| Add Member | ✅ | ✅ | ✗ | ✅ |
| Remove Member | ✅ | ✗ | ✗ | ✅ |
| Update Role | ✅ | ✗ | ✗ | ✅ |
| Assign Tasks | ✅ | ✅ | ✗ | ✅ |
| View Stats | ✅ | ✅ | ✅ | ✅ |

## Unique Features

### 1. **Team Workload Distribution**
The statistics page shows how workload is distributed across team members, helping identify who might be overloaded.

### 2. **Bulk Task Assignment**
Efficiently assign multiple tasks to a team at once, perfect for team-based sprints or project phases.

### 3. **Team Icons & Colors**
Each team has its own icon and color for easy visual identification and organization.

### 4. **Flexible Task Assignment**
Tasks can belong to:
- Projects (existing feature)
- Teams (new feature)
- Both projects and teams (flexible)
- Just individual assignees (as before)

### 5. **Team Activity Tracking**
Keep track of all changes within a team through the activity feed.

## Future Enhancement Ideas

- [ ] Team chat/messaging
- [ ] Team performance trends over time
- [ ] Export team reports (PDF)
- [ ] Team invitations via email
- [ ] Recurring team tasks
- [ ] Team templates
- [ ] Role-based permissions customization
- [ ] Team notifications/alerts
- [ ] Time tracking by team
- [ ] Team goals/milestones

## Navigation

The Teams feature is accessible from the main sidebar navigation (👥 Teams link) when logged in.

## Support

For issues or questions about the Teams feature, contact your administrator or refer to the main application documentation.

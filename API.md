# API Documentation

## Base URL

```
http://localhost:5000/api
```

Production: `https://<railway-backend>.up.railway.app/api`

## Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require Bearer token:

```
Authorization: Bearer <access_token>
```

### Response Format

All endpoints return a consistent JSON format:

```json
{
  "success": true,
  "data": {...} or null,
  "message": "Human-readable message",
  "errors": [{"field": "fieldName", "message": "error message"}]
}
```

---

## Authentication Endpoints

### POST `/auth/signup`

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "member"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    },
    "accessToken": "jwt-token"
  },
  "message": "User created successfully"
}
```

**Validation Rules:**
- `name`: 2-100 characters
- `email`: Valid email format, must be unique
- `password`: Minimum 6 characters, at least 1 uppercase letter and 1 number
- `role`: "admin" or "member"

---

### POST `/auth/login`

Login user and receive tokens.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    },
    "accessToken": "jwt-token"
  },
  "message": "Logged in successfully"
}
```

**Note:** Refresh token is automatically stored in httpOnly cookie.

---

### POST `/auth/refresh`

Refresh access token using refresh token from cookie.

**Response (200):**
```json
{
  "success": true,
  "data": { "accessToken": "new-jwt-token" },
  "message": "Token refreshed"
}
```

---

### POST `/auth/logout`

Logout user (clears refresh token).

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### GET `/users/me`

Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PATCH `/users/me`

Update current user profile.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "Jane Doe", ... }
}
```

---

### GET `/users` (Admin only)

Get all users.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "John", "email": "john@...", "role": "admin", ... },
    ...
  ]
}
```

---

### GET `/users/workload` (Admin only)

Get workload stats for all users.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "name": "John",
      "totalTasks": 10,
      "completedTasks": 5,
      "inProgressTasks": 3,
      "overdueTasks": 2
    },
    ...
  ]
}
```

---

## Project Endpoints

### GET `/projects`

Get all projects (owned or member).

**Query Params:**
- `search`: Filter by title/description
- `status`: "active" or "archived"

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Mobile App",
      "description": "iOS and Android app",
      "color": "#6366F1",
      "ownerId": "uuid",
      "tasks": [...]
    },
    ...
  ]
}
```

---

### POST `/projects` (Admin only)

Create a new project.

**Request:**
```json
{
  "title": "Mobile App",
  "description": "iOS and Android app",
  "color": "#6366F1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "title": "Mobile App", ... }
}
```

---

### GET `/projects/:id`

Get project details with tasks and members.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mobile App",
    "description": "...",
    "color": "#6366F1",
    "tasks": [...],
    "members": [...]
  }
}
```

---

### PATCH `/projects/:id` (Admin only)

Update project.

**Request:**
```json
{
  "title": "New Title",
  "description": "New description",
  "color": "#EC4899"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", ... }
}
```

---

### DELETE `/projects/:id` (Admin only)

Delete project (cascade deletes tasks).

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted"
}
```

---

### GET `/projects/:id/members`

Get project members with task load.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John",
      "email": "john@...",
      "taskCount": 5
    },
    ...
  ]
}
```

---

### POST `/projects/:id/members/invite` (Admin only)

Invite member via email.

**Request:**
```json
{
  "email": "newmember@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Member invited successfully"
}
```

---

## Task Endpoints

### GET `/tasks`

Get all tasks (filtered by user access).

**Query Params:**
- `projectId`: Filter by project
- `status`: "todo", "in-progress", "done", "overdue"
- `priority`: "low", "medium", "high", "critical"
- `search`: Search by title
- `assigneeId`: Filter by assignee

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Design login page",
      "description": "...",
      "status": "in-progress",
      "priority": "high",
      "projectId": "uuid",
      "assigneeId": "uuid",
      "dueDate": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    ...
  ]
}
```

---

### POST `/tasks` (Admin only)

Create a new task.

**Request:**
```json
{
  "title": "Design login page",
  "description": "Create UI mockups and design",
  "projectId": "uuid",
  "assigneeId": "uuid",
  "priority": "high",
  "dueDate": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", ... }
}
```

---

### GET `/tasks/:id`

Get task details with comments.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Design login page",
    "description": "...",
    "status": "in-progress",
    "priority": "high",
    "project": { "id": "uuid", "title": "Mobile App" },
    "assignee": { "id": "uuid", "name": "John" },
    "comments": [...]
  }
}
```

---

### PATCH `/tasks/:id`

Update task (Admin or assigned member).

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "done",
  "priority": "medium",
  "assigneeId": "uuid",
  "dueDate": "2024-01-20"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", ... }
}
```

---

### DELETE `/tasks/:id` (Admin only)

Delete task.

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## Comment Endpoints

### GET `/tasks/:taskId/comments`

Get all comments for a task.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "body": "This looks great!",
      "user": { "id": "uuid", "name": "John" },
      "createdAt": "2024-01-01T12:00:00Z"
    },
    ...
  ]
}
```

---

### POST `/tasks/:taskId/comments`

Add comment to task.

**Request:**
```json
{
  "body": "This looks great!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "body": "...", "user": {...} }
}
```

---

### DELETE `/comments/:id` (Owner or Admin)

Delete comment.

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted"
}
```

---

## Error Responses

### 400 Bad Request (Validation Error)

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized. Please login.",
  "data": null
}
```

**Frontend Action:** Automatically tries to refresh token. If refresh fails, redirects to login.

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "data": null
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider adding:
- Express rate limiter (per IP or per user)
- Recommended: 100 requests per 15 minutes

---

## Pagination

Not yet implemented. For large result sets, consider paginating:

```
GET /tasks?page=1&limit=20
```

Response would include:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

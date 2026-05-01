# Team Task Manager 🚀

A premium, production-quality full-stack task management application built for teams and internship assessments. Features a modern dark-first UI, drag-and-drop Kanban board, role-based access control, and real-time task tracking.

## Features

✨ **Core Features**
- **Authentication:** JWT-based auth with access/refresh token pattern
- **Role-Based Access Control:** Admin and Member roles with granular permissions
- **Kanban Board:** Drag-and-drop task management with status persistence
- **Task Management:** Create, edit, delete tasks with priorities and due dates
- **Project Management:** Organize tasks into projects with team collaboration
- **Comments & Activity:** Thread-based comments and activity logging
- **Dashboard:** Real-time stats, charts, and activity feeds
- **Responsive Design:** Mobile-first, dark-mode-first styling

🎨 **Design**
- Deep navy/slate dark theme with violet accents
- Smooth animations and micro-interactions
- Skeleton loaders for perceived performance
- Toast notifications for user feedback
- Responsive sidebar navigation

🔒 **Security**
- Bcrypt password hashing
- JWT token-based authentication
- httpOnly refresh token cookies
- CORS protection
- Input validation and sanitization

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Auth:** JWT (access + refresh token pattern)
- **Validation:** express-validator
- **Task Scheduling:** node-cron

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS (dark mode)
- **State Management:** React Context API
- **Form Validation:** react-hook-form + Zod
- **UI Components:** Lucide React (icons)
- **Drag & Drop:** @dnd-kit/core
- **Charts:** Recharts
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Notifications:** Sonner

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 18+ and PostgreSQL 13+

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd task-manager

# Copy environment template
cp .env.example .env

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# PostgreSQL: localhost:5432
```

### Option 2: Local Development (Manual Setup)

#### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example in server/)
cp .env.example .env

# Update POSTGRES_URL in .env to point to your local PostgreSQL

# Run database migrations (if using migrations)
npm run migrate

# Start backend (will sync models with DB)
npm run dev
```

#### Frontend Setup

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## Project Structure

```
task-manager/
├── server/                    # Express.js Backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, RBAC, validation
│   ├── models/               # Sequelize models
│   ├── routes/               # API routes
│   ├── utils/                # Helper functions
│   ├── server.js             # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route pages
│   │   ├── api/              # Axios configuration
│   │   ├── lib/              # Utilities and schemas
│   │   ├── layouts/          # Layout components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # TailwindCSS globals
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # Local development orchestration
├── .env.example              # Environment template
├── .gitignore
└── README.md                 # This file
```

## API Documentation

### Authentication Routes

```
POST   /api/auth/signup       # Register new user
POST   /api/auth/login        # Login and get tokens
POST   /api/auth/refresh      # Refresh access token
POST   /api/auth/logout       # Logout (clear cookies)
```

### Project Routes

```
GET    /api/projects          # Get user's projects
POST   /api/projects          # Create project (admin only)
GET    /api/projects/:id      # Get project details
PATCH  /api/projects/:id      # Update project (admin only)
DELETE /api/projects/:id      # Delete project (admin only)
POST   /api/projects/:id/invite # Invite members (admin only)
GET    /api/projects/:id/members # Get project members
```

### Task Routes

```
GET    /api/tasks             # Get tasks (with filters)
POST   /api/tasks             # Create task (admin only)
GET    /api/tasks/:id         # Get task details
PATCH  /api/tasks/:id         # Update task
DELETE /api/tasks/:id         # Delete task (admin only)
```

### Comment Routes

```
GET    /api/tasks/:id/comments      # Get task comments
POST   /api/tasks/:id/comments      # Add comment
```

### User Routes

```
GET    /api/users/me          # Get current user profile
PATCH  /api/users/me          # Update profile
GET    /api/users             # Get all users (admin only)
```

## Data Models

### User
```
id          - UUID primary key
name        - String
email       - String (unique)
passwordHash - String (bcrypt)
role        - Enum: 'admin' | 'member' (default: 'member')
avatar      - String (initials or color code)
createdAt   - Timestamp
updatedAt   - Timestamp
```

### Project
```
id          - UUID primary key
title       - String
description - String
color       - String (hex color)
ownerId     - FK to User
createdAt   - Timestamp
updatedAt   - Timestamp
```

### ProjectMember (Junction Table)
```
projectId   - FK to Project
userId      - FK to User
joinedAt    - Timestamp
```

### Task
```
id          - UUID primary key
title       - String
description - String
status      - Enum: 'todo' | 'in-progress' | 'done' | 'overdue'
priority    - Enum: 'low' | 'medium' | 'high' | 'critical'
projectId   - FK to Project
assigneeId  - FK to User (nullable)
dueDate     - Date (nullable)
createdAt   - Timestamp
updatedAt   - Timestamp
```

### Comment
```
id          - UUID primary key
taskId      - FK to Task
userId      - FK to User
body        - String
createdAt   - Timestamp
updatedAt   - Timestamp
```

## Pages & Routes

### Public Routes
- `/login` - Login page
- `/signup` - Sign up page

### Protected Routes
- `/dashboard` - Main dashboard with stats
- `/projects` - Projects list
- `/projects/:id` - Project Kanban board
- `/tasks/:id` - Task detail panel
- `/profile` - User profile settings
- `/admin` - Admin panel (admin only)

## Role-Based Access Control

### Admin Permissions
✅ Create, edit, delete projects
✅ Invite/remove project members
✅ Create, edit, delete tasks
✅ Assign tasks to any user
✅ View all members and workload
✅ Access admin panel

### Member Permissions
✅ View assigned projects
✅ Create tasks in their projects
✅ Update status of assigned tasks
✅ Add comments
✅ View project members
❌ Create/delete projects
❌ Manage project members
❌ Delete tasks
❌ Assign tasks to others

## Kanban Board Features

- **Drag & Drop:** Move tasks between columns (Todo, In Progress, Done, Overdue)
- **Optimistic UI:** Task status updates immediately, rolls back on error
- **Filtering:** Filter by priority and search by title
- **Inline Creation:** Add new tasks directly in columns
- **Task Indicators:** Priority badges, assignee avatars, due date chips (red if overdue)
- **Column Badges:** Task count per column

## Dashboard Features

- **Stat Cards:** Total tasks, completed, in-progress, overdue
- **Completion Chart:** 7-day task completion trend (Recharts)
- **My Tasks:** Top 5 assigned tasks sorted by due date
- **Activity Feed:** Recent task creation and update events

## Dark Mode

- Enabled by default
- Toggle in profile or navbar
- Persisted in localStorage
- TailwindCSS dark mode utilities

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

```env
# Database
POSTGRES_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Task Manager
```

## Development Scripts

### Backend
```bash
cd server
npm run dev        # Start with hot-reload
npm start          # Start production
npm run migrate    # Run migrations (if applicable)
```

### Frontend
```bash
cd client
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=<your-railway-backend-url>`
4. Deploy

### Railway (Backend)

1. Connect GitHub repository to Railway
2. Create PostgreSQL database plugin
3. Set environment variables:
   - `POSTGRES_URL` (auto-set by Railway)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
4. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## Testing

```bash
# Backend: Test endpoints with Postman/Insomnia
# Frontend: Run in development mode, test user flows

# Test checklist:
# - Signup/Login flow
# - Create project
# - Create tasks in project
# - Drag task between columns
# - Add comments
# - Test role-based permissions
# - Test token refresh on page reload
```

## Security Considerations

- JWT secrets must be changed in production
- Use HTTPS in production
- Enable CORS for specific domains only
- Refresh tokens stored in httpOnly cookies
- Input validation on all routes
- Password hashing with bcrypt

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Docker Issues
```bash
# Clear all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

### Database Connection
```bash
# Check if Postgres is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Frontend Not Connecting to Backend
- Verify `VITE_API_URL` in `.env` matches backend URL
- Check CORS settings in `server.js`
- Ensure backend is running and healthy

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Author

Built as a premium internship assessment project.

---

**Last Updated:** May 2026

For questions or issues, please open a GitHub issue.

# Deployment Guide

## Overview

This guide covers how to run the Task Manager application locally (via Docker or manual setup) and deploy to production (Vercel + Railway).

---

## Local Development

### Prerequisites

- Docker & Docker Compose (recommended)
- OR: Node.js 18+, npm/yarn, PostgreSQL 13+

### Option 1: Docker Compose (Easiest)

```bash
# Clone and navigate to project
git clone <repo-url>
cd task-manager

# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL, Node backend, React frontend)
docker-compose up --build

# Wait for all services to be ready (~30 seconds)
# Frontend will be available at: http://localhost:5173
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

**Stopping services:**
```bash
docker-compose down
```

**Restart without rebuilding:**
```bash
docker-compose up
```

### Option 2: Local Development (Manual)

#### 1. Setup PostgreSQL

```bash
# On Windows (using chocolatey)
choco install postgresql

# Create database
createdb task_manager_dev

# Or use Docker for just the database:
docker run --name task-manager-db -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=task_manager_dev -p 5432:5432 -d postgres:15-alpine
```

#### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and ensure POSTGRES_URL points to your local database
# Default: postgresql://taskmanager:password123@localhost:5432/task_manager_dev

# Start server (models will auto-sync on first run)
npm run dev

# Server will be available at http://localhost:5000
```

#### 3. Setup Frontend (new terminal)

```bash
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Ensure VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev

# Frontend will be available at http://localhost:5173
```

---

## Test the Application

### Create Test Account

1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Fill in credentials:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123 (must have uppercase + number)
   - Role: Admin (to access all features)
4. Click "Sign Up"

### Test User Flows

**Dashboard:**
- View stats cards (total, completed, in-progress, overdue tasks)
- See task completion chart
- Check assigned tasks

**Projects:**
- View list of projects
- Click to see project detail
- (Admin) Create new project button

**Project Detail (Kanban):**
- View tasks in 4 columns: Todo, In-Progress, Done, Overdue
- Search and filter by priority
- Click task to see details
- (Admin) Add task button in each column

**Task Detail:**
- View task information
- See comments thread
- Quick action buttons

**Admin Panel:**
- View all team members
- See member workload stats
- (Admin only, check after login as admin)

**Profile:**
- Edit name and email
- Toggle dark mode
- Logout

---

## Production Deployment

### Deploy Backend to Railway

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to https://railway.app
   - Create new project
   - Select "Deploy from GitHub"
   - Connect GitHub and select your repository

3. **Configure Build**
   - Set Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Set Environment Variables on Railway**
   ```
   NODE_ENV=production
   PORT=5000
   POSTGRES_URL=postgresql://... (Railway will provide)
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

5. **Add PostgreSQL Plugin**
   - In Railway project, add PostgreSQL plugin
   - It will auto-populate POSTGRES_URL

6. **Deploy**
   - Railway automatically deploys on git push
   - Backend will be available at: `https://<railway-project>.up.railway.app`

### Deploy Frontend to Vercel

1. **Push to GitHub** (same repo or separate)
   - Ensure `client/` directory is in root or push separately

2. **Create Vercel Project**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Select "task-manager" or create new

3. **Configure Build**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://<your-railway-backend-url>
   ```

5. **Deploy**
   - Vercel automatically deploys on git push
   - Frontend will be available at: `https://<vercel-project-url>.vercel.app`

### Update CORS

After deploying frontend to Vercel, update backend environment variables:

```
CORS_ORIGIN=https://<your-vercel-frontend-url>.vercel.app
```

Then redeploy backend.

---

## Environment Variables Reference

### Backend (.env or railway config)

```
NODE_ENV=production              # development or production
PORT=5000                        # Server port
POSTGRES_URL=postgresql://...    # Database URL
JWT_SECRET=<strong-random>       # JWT signing key
JWT_REFRESH_SECRET=<strong-random>  # Refresh token key
JWT_EXPIRE=15m                   # Access token lifetime
JWT_REFRESH_EXPIRE=7d            # Refresh token lifetime
CORS_ORIGIN=https://...          # Frontend URL for CORS
```

### Frontend (.env or vercel config)

```
VITE_API_URL=http://localhost:5000  # Backend API URL
VITE_APP_NAME=Task Manager          # App name in UI
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
- Ensure PostgreSQL is running
- Check POSTGRES_URL is correct
- Verify database exists: `psql -U taskmanager -d task_manager_dev`

### Issue: Frontend shows 401 errors

**Solution:**
- Check if backend is running: `curl http://localhost:5000/api/health`
- Verify VITE_API_URL in frontend .env matches backend URL
- Check browser console for error details

### Issue: "CORS error" in frontend

**Solution:**
- Verify CORS_ORIGIN in backend matches frontend URL
- In development, should be `http://localhost:5173`
- In production, should be your Vercel URL

### Issue: Dark mode not persisting

**Solution:**
- Check localStorage is enabled in browser
- Clear browser cache and reload

### Issue: Signup fails with validation error

**Solution:**
- Password must be at least 6 characters with 1 uppercase + 1 number
- Email must be valid format
- Check backend validation output in server logs

---

## Performance Tips

1. **Database:**
   - Railway provides good defaults; monitor in dashboard
   - Consider connection pooling for high traffic

2. **Frontend:**
   - Vercel provides CDN; builds are fast (~1 min)
   - Use Vercel Analytics for performance monitoring

3. **Backend:**
   - Use Railway's scaling options for peak traffic
   - Monitor memory usage; may need to upgrade

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] JWT_REFRESH_SECRET is different from JWT_SECRET
- [ ] CORS_ORIGIN only allows your frontend domain
- [ ] Database password is strong (not "password123" in production)
- [ ] HTTPS is enabled on both frontend and backend
- [ ] Environment variables are set on production servers (not in code)
- [ ] Secrets are never committed to git

---

## Support

If you encounter issues:

1. Check backend logs: `docker-compose logs server`
2. Check frontend console: Browser DevTools → Console
3. Check database: `psql` command line
4. Review this guide again
5. Check application README.md for API documentation

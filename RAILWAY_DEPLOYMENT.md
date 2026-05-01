# Railway Deployment Guide (No Docker) 🚀

## Overview
This guide provides step-by-step instructions to deploy the Task Manager application to Railway **without using Docker**. Railway supports direct Node.js deployment which will automatically handle the build and deployment.

---

## Prerequisites

1. **Railway Account** - Create one at [railway.app](https://railway.app)
2. **Git Repository** - Your code pushed to GitHub (or GitLab/Bitbucket)
3. **Node.js Environment** - Railway auto-detects your Node.js app
4. **PostgreSQL Database** - Railway will provision this for you

---

## Step 1: Prepare Your Local Environment

### 1.1 Install Dependencies

```bash
# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 1.2 Create Environment File

Copy `.env.example` to `.env` and update values for local development:

```bash
cp .env.example .env
```

**Important Environment Variables for Development:**
```env
NODE_ENV=development
PORT=5000
POSTGRES_URL=postgresql://taskmanager:password123@localhost:5432/task_manager_dev
JWT_SECRET=your-dev-secret-key
JWT_REFRESH_SECRET=your-dev-refresh-secret
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

### 1.3 Test Locally

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend (in another terminal)
cd client
npm run dev
```

Visit `http://localhost:5173` to verify everything works.

---

## Step 2: Push Code to Git Repository

```bash
# Make sure you're in the root directory
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## Step 3: Create Railway Project

### 3.1 Log in to Railway

Visit [railway.app](https://railway.app) and log in with your account.

### 3.2 Create New Project

1. Click **"New Project"** button
2. Select **"Deploy from GitHub"**
3. Connect your GitHub account and select your repository
4. Choose your repo and branch (usually `main`)

### 3.3 Add PostgreSQL Database

Railway will start building your app. While it builds:

1. Click **"Add a service"** or **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a PostgreSQL instance
4. It automatically adds a `DATABASE_URL` environment variable

---

## Step 4: Configure Environment Variables

In Railway Dashboard:

### 4.1 Click on Your Service

Select your Node.js service from the project canvas.

### 4.2 Go to Variables Tab

1. Click the **"Variables"** tab
2. Add the following environment variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-deployed-url.railway.app
VITE_API_URL=https://your-deployed-url.railway.app
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>
```

### 4.3 Generate Secure Keys

For production JWT secrets, use a command like:

**Mac/Linux:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([byte[]](Get-Random -Count 32))
```

Or use an online generator: [generate-random.org](https://www.random.org/strings/)

### 4.4 Example Production Variables

```env
NODE_ENV=production
JWT_SECRET=a7f3k9m2b4n6z1p8x5c0v2e9r3t7u1i4o5q2w3e
JWT_REFRESH_SECRET=b8g4l0n3c5m7p9r1s4u6v8x0y2z4a6b8d0e2f4h
CLIENT_URL=https://task-manager.railway.app
VITE_API_URL=https://task-manager.railway.app
```

---

## Step 5: Configure Railway Build & Deploy Settings

### 5.1 Build Command

Railway auto-detects your `package.json` and will use the `start:prod` script.

**Verify in Railway Settings:**
1. Go to **"Deployments"** tab
2. Click on your latest deployment
3. Verify the build succeeded (green checkmark)

### 5.2 Expected Build Output

```
Installing dependencies...
npm install
Building client...
npm run build:client
Starting application...
npm run start:prod
✓ Server running on port 5000
✓ Database connected
✓ Cron jobs scheduled
```

---

## Step 6: Verify Deployment

### 6.1 Check Application URL

1. In Railway, click on your service
2. Find the **"Public URL"** or **"Deployment"** section
3. Click the generated URL (e.g., `https://task-manager-prod.railway.app`)

### 6.2 Test API Health

Visit: `https://your-deployed-url.railway.app/api/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-05-02T10:30:00.000Z"
}
```

### 6.3 Test Frontend

Visit: `https://your-deployed-url.railway.app`

The React app should load. Try logging in to verify the full stack works.

---

## Step 7: Database Setup

### 7.1 Run Initial Migrations

Railway's auto-sync should create tables on first deployment. However, if needed:

```bash
# Locally test database sync
npm run dev
# Should log: "All models were synchronized successfully"
```

### 7.2 Verify Data Persistence

1. Create a test user/task in the deployed app
2. Refresh the page to confirm data persists
3. Check logs to verify no database errors

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Rebuild dependencies locally
npm install

# Push to git and redeploy
git push origin main
```

### Issue: Database connection fails

**Solution:**
1. Check `DATABASE_URL` is set in Railway Variables
2. Verify database service is running (green icon)
3. Check server logs in Railway Dashboard

**View Logs:**
```
Railway Dashboard → Your Service → "Logs" tab
```

### Issue: Frontend shows 404 on refresh

**Solution:**
This is likely a routing issue. The server should serve `index.html` for all non-API routes.

**Verify:**
1. Check `NODE_ENV=production` is set
2. Ensure `npm run build:client` completes successfully
3. Restart deployment

### Issue: CORS errors on frontend

**Solution:**
1. Update `CLIENT_URL` in Railway Variables
2. Example: `https://your-app.railway.app` (no trailing slash)
3. Restart the service

**Common CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:**
- In Railway, set: `CLIENT_URL=https://your-deployed-domain.railway.app`

---

## Performance Tips

### Enable Caching
```bash
# Client caching (automatic with Vite build)
# Already configured in vite.config.js
```

### Monitor Resource Usage

1. Railway Dashboard → **"Metrics"** tab
2. Check CPU, Memory, Network usage
3. If high, consider upgrading plan

### Optimize Database Connections

The application automatically pools 2-10 PostgreSQL connections. No manual configuration needed.

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Deployment environment | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-provided by Railway |
| `JWT_SECRET` | JWT signing key | `a7f3k9m2b4n6z1p8...` |
| `JWT_REFRESH_SECRET` | Refresh token key | `b8g4l0n3c5m7p9r1s...` |
| `CLIENT_URL` | Frontend base URL | `https://app.railway.app` |
| `VITE_API_URL` | API base URL for frontend | `https://app.railway.app` |
| `JWT_EXPIRE` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token lifetime | `7d` |

---

## Deployment Files

This deployment uses the following configuration files:

### `Procfile`
```
web: npm run start:prod
```
Tells Railway how to start your app.

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod"
  }
}
```
Advanced Railway configuration.

### `server/package.json` (scripts section)
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "start:prod": "npm run build:client && node server.js",
  "build:client": "cd ../client && npm run build && cd ../server"
}
```
Build pipeline for production.

---

## Next Steps

1. ✅ Set up Railway PostgreSQL backup
   - Railway Dashboard → Database → Backup settings

2. ✅ Enable monitoring & alerts
   - Railway Dashboard → Alerts

3. ✅ Set up custom domain
   - Railway Dashboard → Domains → Add custom domain

4. ✅ Configure auto-deployments
   - Railway Dashboard → GitHub settings → auto-deploy on push

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Community:** https://railway.app/support
- **GitHub Issues:** Create an issue in your repository

---

## Quick Commands Reference

```bash
# Local development
cd server && npm run dev  # Terminal 1
cd client && npm run dev  # Terminal 2

# Local build test
npm run build:client
npm run start

# Push to Railway
git push origin main  # Railway auto-deploys

# View Railway logs
# Use Railway Dashboard → Logs tab
```

---

**Deployed! 🎉** Your Task Manager is now live on Railway!

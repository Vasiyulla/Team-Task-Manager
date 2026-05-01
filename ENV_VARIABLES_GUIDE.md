# Environment Variables Clarification & Reference

## The Main Confusion Explained

> **The confusion:** "Where do I put my environment variables?" 

### Answer: DIFFERENT PLACES FOR DIFFERENT PURPOSES

---

## Overview Table

| Scenario | Where | Method | Example |
|----------|-------|--------|---------|
| **Local Development** | `.env` file | Create a `.env` file locally | `JWT_SECRET=dev-key` |
| **Railway Production** | Railway Dashboard | Set in Variables tab | Use Railway UI |
| **Sharing Config** | `.env.example` | Git repository | Documentation only |
| **Secret Management** | Railway Dashboard | Never in `.env` file | JWT keys, secrets |

---

## ❌ The Wrong Way (Old/Confusing)

```bash
# DON'T DO THIS:

# Committing .env to git with secrets
git add .env
git commit -m "Added env"
git push  # ❌ WRONG - secrets exposed!

# Or manually passing environment vars without system
PORT=5000 JWT_SECRET=abc123 node server.js  # ❌ Not persistent
```

---

## ✅ The Correct Way

### For Local Development

```bash
# 1. Create .env from template
cp .env.example .env

# 2. Edit .env with LOCAL values only
# .env file content:
NODE_ENV=development
PORT=5000
JWT_SECRET=my-dev-secret-key
VITE_API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# 3. .env is in .gitignore (automatically excluded)
# Do NOT commit this file

# 4. Run your app - Node will read .env automatically
npm run dev
```

### For Railway Deployment

```bash
# 1. Railway Dashboard
# 2. Navigate to your service
# 3. Click "Variables" tab
# 4. Add these (Railway provides DATABASE_URL automatically):

NODE_ENV=production
JWT_SECRET=your-generated-production-key-here
JWT_REFRESH_SECRET=your-generated-refresh-key-here
CLIENT_URL=https://your-app.railway.app
VITE_API_URL=https://your-app.railway.app

# 5. Click "Save" or "Add"
# 6. Railway auto-restarts with new variables
```

---

## File-by-File Breakdown

### `.env.example` (Checked into Git ✅)

```env
# This file shows WHAT variables are needed
# But NOT the actual values
# Developers copy this and fill in their own values

NODE_ENV=development
PORT=5000
POSTGRES_USER=taskmanager
POSTGRES_PASSWORD=your_secure_password_here  # <- TEMPLATE
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  # <- TEMPLATE
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

**Purpose:** Documentation for other developers
**Update:** When adding new variables to the project

### `.env` (NOT in Git ❌)

```env
# This file contains YOUR ACTUAL VALUES
# It's in .gitignore - never committed to git
# Each developer has their own .env with their own values

NODE_ENV=development
PORT=5000
JWT_SECRET=abc123mysecretdevkey789
POSTGRES_PASSWORD=mylocaldatabasepassword
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

**Purpose:** Local development configuration
**Update:** When you need to change values locally
**Security:** Keep secrets safe - never push to git

---

## Variable Categories

### Database Variables

**Local Development:**
```env
# Option 1: Use SQLite (default - no variables needed)
# Just don't set DATABASE_URL or POSTGRES_URL

# Option 2: Use local PostgreSQL
POSTGRES_URL=postgresql://taskmanager:password123@localhost:5432/task_manager_dev
```

**Railway Production:**
```
# AUTO-PROVIDED - Don't set yourself!
DATABASE_URL=postgresql://user:pass@host:5432/db  # Set by Railway
```

### Security Variables

**Local Development:**
```env
# For development, can be simple
JWT_SECRET=my-simple-dev-secret
JWT_REFRESH_SECRET=my-simple-refresh-secret
```

**Railway Production:**
```
# MUST be secure random strings!
# Generate using: openssl rand -hex 32
# Or: https://www.random.org/strings/
JWT_SECRET=a7f3k9m2b4n6z1p8x5c0v2e9r3t7u1i4o5q2w3e
JWT_REFRESH_SECRET=b8g4l0n3c5m7p9r1s4u6v8x0y2z4a6b8d0e2f4h
```

### URL Variables

**Local Development:**
```env
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

**Railway Production:**
```
# Use your Railway domain (get from dashboard)
CLIENT_URL=https://task-manager-prod-xyz.railway.app
VITE_API_URL=https://task-manager-prod-xyz.railway.app
```

---

## Step-by-Step Setup

### For Local Development

```bash
# Step 1: Create .env
cp .env.example .env

# Step 2: Edit .env
nano .env  # or edit in VS Code

# Step 3: Verify it works
npm run dev

# Step 4: Never commit it
git add .  # Git ignores .env automatically
git commit -m "Setup local environment"
```

### For Railway Deployment

```bash
# Step 1: Go to Railway Dashboard
# Step 2: Select your Node.js service
# Step 3: Click "Variables" tab
# Step 4: Add each variable (click "Add Variable")
# Step 5: Copy from:
#   - DATABASE_URL: Auto-provided (don't change)
#   - JWT_SECRET: Generate with openssl rand -hex 32
#   - Other vars: Use your Railway domain
# Step 6: Click Save/Add
# Step 7: Railway auto-restarts - done!
```

---

## Common Mistakes

### ❌ Mistake 1: Committing .env to git

```bash
# WRONG:
git add .env
git commit -m "Added environment"
git push  # ❌ DANGER: Secrets exposed!
```

**Fix:**
```bash
# .env should be in .gitignore (it is by default)
# Remove from git if accidentally added:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

### ❌ Mistake 2: Not updating VITE_API_URL on Railway

```env
# WRONG - using local URL in production:
VITE_API_URL=http://localhost:5000  # ❌ Won't work on Railway!
```

**Fix:**
```env
# CORRECT - use Railway domain:
VITE_API_URL=https://your-app.railway.app  # ✅
```

### ❌ Mistake 3: Using simple secrets in production

```env
# WRONG - not secure:
JWT_SECRET=my-secret-key  # ❌ Too simple
```

**Fix:**
```bash
# Generate secure key:
openssl rand -hex 32
# Then use output in Railway Variables
JWT_SECRET=a7f3k9m2b4n6z1p8x5c0v2e9r3t7u1i4o5q2w3e  # ✅
```

### ❌ Mistake 4: Updating .env.example with secrets

```env
# WRONG - secrets in template:
JWT_SECRET=prod-secret-key-12345  # ❌ Don't do this!
```

**Fix:**
```env
# CORRECT - use placeholder:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  # ✅
```

---

## When to Update Each File

### Update `.env.example`

- [ ] Adding a new variable to the project
- [ ] Changing variable names
- [ ] Documenting new config options

```bash
# Example: You added SENDGRID_API_KEY support
# Update .env.example:
SENDGRID_API_KEY=your-sendgrid-key-here
```

### Update `.env` (locally)

- [ ] Testing with different database
- [ ] Changing local port
- [ ] Testing different credentials

### Update Railway Variables

- [ ] Changing production secrets
- [ ] Pointing to different service
- [ ] Adjusting production configuration

---

## Reference: All Variables Your App Uses

| Variable | Purpose | Local | Railway | Required |
|----------|---------|-------|---------|----------|
| `NODE_ENV` | Environment | `development` | `production` | Yes |
| `PORT` | Server port | `5000` | `5000` | Yes |
| `DATABASE_URL` | DB connection | Not needed | Auto | Production only |
| `JWT_SECRET` | Token signing | Dev key | Secure key | Yes |
| `JWT_REFRESH_SECRET` | Refresh token | Dev key | Secure key | Yes |
| `JWT_EXPIRE` | Token lifetime | `15m` | `15m` | No |
| `JWT_REFRESH_EXPIRE` | Refresh lifetime | `7d` | `7d` | No |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` | Railway domain | Yes |
| `VITE_API_URL` | API URL for client | `http://localhost:5000` | Railway domain | Yes |
| `VITE_APP_NAME` | App name | Task Manager | Task Manager | No |

---

## Checking Variables Are Set

### Local Development

```bash
# See all variables Node is using:
node -e "console.log(process.env)"

# Or in your app:
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
```

### Railway

```
Railway Dashboard → Your Service → Variables tab
# Shows all variables currently set
```

### Debug Current Environment

```javascript
// Add this to server.js temporarily to check what's set:
console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('VITE_API_URL:', process.env.VITE_API_URL);
```

---

## Quick Reference Card

```
LOCAL DEVELOPMENT:
├─ Copy: .env.example → .env
├─ Edit: .env (add your local values)
├─ Ignore: Don't commit .env
├─ Run: npm run dev
└─ Result: App uses .env values

RAILWAY PRODUCTION:
├─ Dashboard: Railways.app
├─ Select: Your Node service
├─ Tab: Variables
├─ Add: JWT_SECRET, CLIENT_URL, VITE_API_URL
├─ Save: Click Add/Save
└─ Result: App restarts with new variables
```

---

## Key Takeaway

> **Use .env for local development. Use Railway Dashboard for production. Never commit secrets to git.**

```
.env.example     → Share in git (template)
.env            → Local only (gitignored)
Railway Vars    → Production (secure)
```

That's it! Simple and secure. ✅

---

## Still Confused?

1. Read: `RAILWAY_QUICK_START.md` - Quick deployment guide
2. Read: `RAILWAY_SETUP_GUIDE.md` - Step-by-step with descriptions
3. Read: `RAILWAY_DEPLOYMENT.md` - Complete detailed guide
4. Ask: Create an issue in your GitHub repo

**Happy deploying!** 🚀

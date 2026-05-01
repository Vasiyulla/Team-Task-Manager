# Railway Setup - Step-by-Step Visual Guide

## Complete Railway Deployment Walkthrough

### Phase 1: Code Preparation ✅

#### Step 1.1: Update Your Code

```bash
# Navigate to project root
cd c:\Users\Dell\Documents\Assi

# Install all dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Create local .env (copy from example)
copy .env.example .env
```

**Update `.env` for local testing:**
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
JWT_SECRET=local-dev-key
JWT_REFRESH_SECRET=local-dev-key
```

#### Step 1.2: Test Locally (Recommended)

**Terminal 1:**
```bash
cd server
npm run dev
# Should output: ✓ Server running on http://localhost:5000
```

**Terminal 2 (new terminal):**
```bash
cd client
npm run dev
# Should output: VITE v5.0... ready in XXXms
```

**Test in Browser:**
- Open: `http://localhost:5173`
- Login with test credentials
- Verify everything works

#### Step 1.3: Commit & Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment - add production config"
git push origin main
```

---

### Phase 2: Railway Setup 🚀

#### Step 2.1: Create Railway Project

1. **Visit:** https://railway.app
2. **Click:** "New Project" button (top right)
3. **Select:** "Deploy from GitHub"
4. **Select Repository:** Choose your task-manager repository
5. **Select Branch:** `main` (or your default branch)
6. **Click:** "Deploy"

Railway will start building your app.

#### Step 2.2: Add PostgreSQL Database

**While the first deployment is running:**

1. **In Railroad Canvas:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Click **"Create"**

2. **PostgreSQL will provision in ~1 minute**
   - Railway automatically creates `DATABASE_URL` environment variable
   - Database is ready for your app

---

### Phase 3: Environment Variables ⚙️

#### Step 3.1: Access Service Variables

1. **In Railway Dashboard:**
   - Click on your **Node.js Service** (not the database)
   - Click **"Variables"** tab (top navigation)

#### Step 3.2: Generate Secure Keys

**For `JWT_SECRET` and `JWT_REFRESH_SECRET`:**

Option 1 (Windows PowerShell):
```powershell
[Convert]::ToBase64String([byte[]](Get-Random -Count 32))
# Output example: ABC123xyz789...
```

Option 2 (Online):
Visit: https://www.random.org/strings/
- Num: 4
- Length: 8
- Characters: A-Z, a-z, 0-9
- Generate 2 strings

#### Step 3.3: Add Production Variables

In Railway **Variables** tab, add these:

```env
NODE_ENV=production
JWT_SECRET=<paste-your-generated-key-here>
JWT_REFRESH_SECRET=<paste-your-second-generated-key-here>
CLIENT_URL=https://task-manager-prod-xyz.railway.app
VITE_API_URL=https://task-manager-prod-xyz.railway.app
```

**Where to get your Railway URL:**
1. In your service settings
2. Look for **"Deployments"** or **"Public URL"** section
3. It will be something like: `https://task-manager-prod-abc123.railway.app`

#### Step 3.4: Save Variables

- Railway auto-saves variables
- Deployment automatically restarts with new variables

---

### Phase 4: Wait for Deployment 🎯

**Typical Timeline:**
```
1. Push to GitHub              ← You did this
2. Railway builds (1-2 min)    ← npm install, npm run build:client
3. Deployment starts (1-2 min) ← npm run start:prod
4. App is LIVE! ✅             ← Ready to use

Total time: 3-5 minutes
```

**Monitor Progress:**
1. Go to **"Deployments"** tab
2. Watch the log stream
3. Look for:
   ```
   ✓ Server running on port 5000
   ✓ Database connected
   ✓ Cron jobs scheduled
   ```

---

### Phase 5: Test Your Deployment ✨

#### Step 5.1: Test API Health

Visit: `https://your-railway-url.railway.app/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-05-02T10:30:00.000Z"
}
```

#### Step 5.2: Test Frontend

1. Visit: `https://your-railway-url.railway.app`
2. You should see the login page
3. Try logging in or creating account
4. Create a test task
5. Refresh page - data should persist

#### Step 5.3: Test API Calls

In browser DevTools (F12):
1. Open **Console** tab
2. Should see API calls to your endpoint
3. No CORS errors should appear

---

## Troubleshooting Quick Reference

### Build Fails

**Symptom:** Red X on deployment

**Fix:**
```bash
# Locally verify everything builds
npm run build:client
# Should complete without errors

git push origin main
# Let Railway retry
```

### App Crashes on Startup

**Symptom:** Green → Red icon in Railway

**Check Logs:**
1. Railway Dashboard → Deployments → Latest
2. Scroll through logs
3. Look for error messages

**Common Fix:**
```env
# Ensure these are set in Variables tab:
NODE_ENV=production
PORT=5000
```

### Database Connection Error

**Symptom:** "Unable to connect to database"

**Fix:**
1. Verify PostgreSQL service is running (green icon)
2. Check `DATABASE_URL` is in Variables (usually auto-added)
3. Restart service

### Frontend Shows Blank Page

**Symptom:** White screen, no errors in console

**Fix:**
1. Ensure `NODE_ENV=production`
2. Check build completed: Deployments → look for `npm run build:client`
3. Restart deployment

### CORS Error on Frontend

**Symptom:** "Cross-Origin Request Blocked"

**Fix:**
In Variables tab:
```env
CLIENT_URL=https://your-app.railway.app
VITE_API_URL=https://your-app.railway.app
```
(Make sure no trailing slashes)

---

## Important Notes

### Security ⚠️

1. **Never** commit `.env` file with real secrets
2. **Always** use Railway Dashboard for production variables
3. **Always** generate new JWT secrets for production
4. **Keep** your `DATABASE_URL` secure (Railway auto-manages this)

### Deployment Files

These files make Railway deployment work:

| File | Purpose |
|------|---------|
| `Procfile` | Tells Railway how to start: `web: npm run start:prod` |
| `railway.json` | Advanced Railway config |
| `server/package.json` | Contains `start:prod` script that builds & starts app |
| `server/server.js` | Serves React frontend in production |
| `client/vite.config.js` | Optimized build for production |

### Database Auto-Sync

Your app uses Sequelize with `auto-sync`:
- Development: Creates/updates tables automatically
- Production: Only creates if needed, won't drop data

No manual migrations needed! ✅

---

## Next Steps

1. ✅ **Deploy:** Follow steps above
2. ✅ **Test:** Visit your live URL
3. ✅ **Monitor:** Check Railway Metrics tab for performance
4. ✅ **Custom Domain:** Add your own domain (optional)
5. ✅ **Backup:** Enable database backups (recommended)

---

## URLs & Resources

- **Your Railway Dashboard:** https://railway.app/dashboard
- **Deployment Docs:** https://docs.railway.app
- **Monitoring Logs:** https://docs.railway.app/reference/logs
- **Troubleshooting:** https://docs.railway.app/troubleshooting

---

## Quick Commands

```bash
# Local testing
cd server && npm run dev      # Terminal 1
cd client && npm run dev      # Terminal 2

# Deploy to Railway
git push origin main

# Check Railway logs
# Via Dashboard → Deployments → Logs tab

# Re-run deployment
# Via Dashboard → Deployments → "Redeploy" button
```

---

## Success Checklist ✅

- [ ] Code pushed to GitHub
- [ ] Railway project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Environment variables set in Railway Dashboard
- [ ] Deployment succeeded (green checkmark)
- [ ] API health check works
- [ ] Frontend loads
- [ ] Can create & view tasks
- [ ] Data persists after refresh

**If all checked: Your app is live! 🎉**

---

## Still Need Help?

1. Check **Logs** in Railway Dashboard
2. Read detailed guide: `RAILWAY_DEPLOYMENT.md`
3. Contact Railway Support: https://railway.app/support
4. Check `.env.example` for variable reference

**Happy Deploying!** 🚀

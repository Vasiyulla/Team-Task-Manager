# Railway Deployment - Complete Checklist

## Pre-Deployment Checklist ✅

### Code Quality
- [ ] All code changes committed to git
- [ ] No uncommitted changes in working directory
- [ ] `.env.example` is clear and documented
- [ ] `.gitignore` includes `.env` (prevents secret leaks)
- [ ] No console.log() debug statements left in code
- [ ] No hardcoded URLs or secrets

### Project Structure
- [ ] Server files in `/server` directory
- [ ] Client files in `/client` directory
- [ ] Both have `package.json` files
- [ ] `Procfile` exists in root (tells Railway how to start)
- [ ] `railway.json` exists in root (Railway config)

### Dependencies
- [ ] Run `cd server && npm install` (should complete)
- [ ] Run `cd client && npm install` (should complete)
- [ ] All dependencies resolve without errors
- [ ] No circular dependencies
- [ ] Node version compatible (check `package.json` engines)

### Local Testing
- [ ] Start server: `cd server && npm run dev`
- [ ] Start client: `cd client && npm run dev` (in new terminal)
- [ ] Visit `http://localhost:5173`
- [ ] Login works
- [ ] Create task works
- [ ] Edit task works
- [ ] Refresh page - data persists
- [ ] No errors in browser console
- [ ] No errors in terminal

---

## Pre-Push Checklist ✅

### Git Status
```bash
git status
# Should show nothing or only untracked files (not .env)
```

### Commit Message
- [ ] Clear, descriptive commit message
- [ ] No secrets in commit message
- [ ] Example: "Prepare for Railway deployment"

### Push Verification
```bash
git log --oneline -5
# Verify your commits are there

git push origin main
# Should push successfully
```

---

## Railway Setup Checklist ✅

### Account Setup
- [ ] Railway account created at https://railway.app
- [ ] GitHub account connected to Railway
- [ ] Verified email address

### Project Creation
- [ ] New Railway project created
- [ ] GitHub repo connected
- [ ] Branch selected (`main`)
- [ ] Initial build started

### Database Setup
- [ ] PostgreSQL database added to project
- [ ] Database service shows green status
- [ ] Database credentials visible

### Environment Variables
In Railway Dashboard → Your Service → Variables tab:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=<generated-secure-key>`
- [ ] `JWT_REFRESH_SECRET=<generated-secure-key>`
- [ ] `CLIENT_URL=https://your-railway-url.railway.app`
- [ ] `VITE_API_URL=https://your-railway-url.railway.app`
- [ ] All variables saved/applied

---

## Deployment Checklist ✅

### Build Process
- [ ] Deployment started automatically after git push
- [ ] Build logs show: `npm install` ✓
- [ ] Build logs show: `npm run build:client` ✓
- [ ] Build logs show: `npm run start:prod` ✓
- [ ] Deployment status shows green checkmark
- [ ] No build failures

### Startup Verification
In Railway Logs, verify these messages appear:
- [ ] `✓ Server running on port 5000`
- [ ] `✓ Database connected`
- [ ] `✓ Using PostgreSQL for production`
- [ ] `✓ Serving static files from: ../client/dist`
- [ ] `✓ Cron jobs scheduled`
- [ ] No error messages in logs

---

## Post-Deployment Testing ✅

### API Testing
```bash
# Replace with your Railway URL
curl https://your-railway-url.railway.app/api/health

# Expected response:
# {"success":true,"message":"Server is running",...}
```

- [ ] Health check returns 200 status
- [ ] Response includes success: true

### Frontend Testing
- [ ] Visit https://your-railway-url.railway.app
- [ ] Page loads without errors
- [ ] Login page appears
- [ ] No 404 or blank page

### Functionality Testing
- [ ] Login with credentials works
- [ ] Dashboard loads
- [ ] Can create new task
- [ ] Can edit existing task
- [ ] Can view tasks
- [ ] Refresh page - data persists
- [ ] Logout works

### Browser Console
- [ ] No red errors
- [ ] No CORS errors
- [ ] No 404 errors for resources

### Network Tab (DevTools)
- [ ] All API calls return 200/201 status
- [ ] No failed requests
- [ ] Static assets load correctly

---

## Common Issues - Verification

### Build Failures

**Symptoms:**
- Red X on deployment
- Build stops with error

**Verification Steps:**
```bash
# 1. Verify local build works
npm run build:client
# Should complete without errors

# 2. Check package.json scripts
cat server/package.json | grep -A 5 "scripts"
# Should include "start:prod" and "build:client"

# 3. Push again
git push origin main
```

- [ ] Local build successful
- [ ] Scripts section correct
- [ ] Pushed to git

### Database Connection Error

**Symptoms:**
- "DATABASE_URL not defined"
- "Cannot connect to database"

**Verification Steps:**
```
Railway Dashboard:
├─ Check PostgreSQL service exists (green icon)
├─ Check DATABASE_URL in Variables tab
├─ If missing, recreate PostgreSQL
└─ Redeploy
```

- [ ] PostgreSQL service exists
- [ ] DATABASE_URL visible in Variables
- [ ] Service restarted

### Frontend Blank Page

**Symptoms:**
- White screen when visiting URL
- No errors in console

**Verification Steps:**
```
Railway Dashboard → Your Service:
├─ Check NODE_ENV=production is set
├─ Check Deployments → see build output
├─ Look for "Serving static files" message
└─ Look for "npm run build:client" success
```

- [ ] NODE_ENV set to production
- [ ] Build completed successfully
- [ ] Build output shows "Serving static files"

### CORS Errors

**Symptoms:**
- "Cross-Origin Request Blocked"
- API calls fail from frontend

**Verification Steps:**
```
Railway Variables:
├─ CLIENT_URL=https://your-app.railway.app
├─ VITE_API_URL=https://your-app.railway.app
├─ No trailing slashes
└─ Restart service
```

- [ ] CLIENT_URL correct (no trailing slash)
- [ ] VITE_API_URL correct (no trailing slash)
- [ ] Service restarted

---

## Performance Verification ✅

### Response Times
- [ ] Homepage loads in < 3 seconds
- [ ] Login responds in < 1 second
- [ ] Tasks load in < 2 seconds

### Database Performance
```
Railway Dashboard → Metrics:
├─ CPU usage < 50%
├─ Memory usage < 500MB
└─ Network latency normal
```

- [ ] CPU reasonable
- [ ] Memory reasonable
- [ ] Network stable

---

## Final Verification ✅

### Security
- [ ] No `.env` file committed
- [ ] Secrets only in Railway Dashboard
- [ ] JWT secrets are secure random strings
- [ ] HTTPS enforced (Railway auto-provides)

### Monitoring
- [ ] Railway Metrics accessible
- [ ] Logs viewable in Dashboard
- [ ] No persistent error messages

### Documentation
- [ ] `.env.example` contains all variables
- [ ] README updated if needed
- [ ] RAILWAY_DEPLOYMENT.md accessible
- [ ] Team aware of production URL

---

## Success Indicators ✅

Your deployment is successful when:

- ✅ Code deployed to Railway
- ✅ API health check works
- ✅ Frontend loads
- ✅ Login works
- ✅ Can create/edit tasks
- ✅ Data persists after refresh
- ✅ No errors in logs
- ✅ No CORS errors
- ✅ Response times normal

---

## After Deployment

### Recommended Next Steps

1. **Set up Backups**
   ```
   Railway Dashboard → PostgreSQL → Settings
   Enable automatic backups
   ```

2. **Enable Monitoring**
   ```
   Railway Dashboard → Alerts
   Set up CPU/Memory alerts
   ```

3. **Custom Domain** (Optional)
   ```
   Railway Dashboard → Domains
   Add your custom domain
   ```

4. **Set up CI/CD** (Optional)
   ```
   Railway auto-deploys on git push
   No manual setup needed!
   ```

### Maintenance Tasks

- [ ] Monitor logs weekly
- [ ] Check database size
- [ ] Update dependencies monthly
- [ ] Test disaster recovery
- [ ] Document any issues

---

## Rollback Procedure (If Needed)

```
Railway Dashboard → Deployments:
├─ Find previous successful deployment
├─ Click "Rollback" button
└─ Select target deployment
```

- Takes 1-2 minutes
- All data preserved
- No manual intervention needed

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `RAILWAY_QUICK_START.md` | Fast overview (5 min) |
| `RAILWAY_SETUP_GUIDE.md` | Step-by-step walkthrough |
| `RAILWAY_DEPLOYMENT.md` | Complete detailed guide |
| `ENV_VARIABLES_GUIDE.md` | Variable reference |
| `.env.example` | Variable documentation |

---

## Need Help?

1. **Check Logs:** Railway Dashboard → Deployments → Logs tab
2. **Read Guides:** See documentation list above
3. **Search Issues:** GitHub issues or Railway docs
4. **Contact Support:** Railway support@railway.app

---

## Sign-Off

- [ ] **Developer Name:** _______________
- [ ] **Date Deployed:** _______________
- [ ] **Production URL:** _______________
- [ ] **Notes:** _______________

---

**Deployment Complete! 🎉**

Your Task Manager is now live on Railway.

Monitor it regularly and update dependencies as needed.

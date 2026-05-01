# ✅ Quick Start - No Docker, No PostgreSQL Installation

Your application is fully configured and ready to run **without Docker and without PostgreSQL installation**.

## What You Have

✅ **Frontend:** React 18 + Vite (fully functional)  
✅ **Backend:** Express.js with SQLite (auto-creates database)  
✅ **Database:** SQLite (no installation needed, file-based)  
✅ **All Dependencies:** Already installed

---

## 🚀 Start the Application (2 Steps Only)

### Step 1: Start Backend (Terminal 1)

```powershell
cd server
npm run dev
```

**Expected Output:**
```
✓ Using SQLite for local development
✓ Database connected
✓ Server running on http://localhost:5000
✓ API health check: http://localhost:5000/api/health
```

**Note:** Database file will be created at `server/task_manager.db`

### Step 2: Start Frontend (Terminal 2)

```powershell
cd client
npm run dev
```

**Expected Output:**
```
VITE v5.0.7 running at:
  ➜  Local:   http://localhost:5173/
```

### Step 3: Open Application

Navigate to **http://localhost:5173** in your browser

---

## 🧪 Test the Application

### Create Your First Account
1. Click "Sign Up" button
2. Fill in:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** TestPass123 (must have uppercase + number)
   - **Role:** Admin (to access all features)
3. Click "Sign Up"

### Explore All Features
- **Dashboard:** View stats cards, charts, and task summary
- **Projects:** Create and manage projects
- **Kanban Board:** Create/filter tasks by status and priority
- **Task Details:** View, edit, add comments
- **Admin Panel:** See all team members and workload (admin only)
- **Profile:** Edit settings, toggle dark mode, logout
- **Dark Mode:** Toggle in top-right navbar

---

## 📊 Application Features

✅ User authentication (signup/login with JWT)  
✅ Dashboard with stats and charts  
✅ Project management and team collaboration  
✅ Task creation, filtering, and status updates  
✅ Comments thread on tasks  
✅ Admin panel for team management  
✅ Dark mode (persisted in browser)  
✅ Responsive mobile-first design  
✅ Role-based access control (Admin/Member)  

---

## 🔄 Stop & Reset

### Stop All Servers
Press `Ctrl+C` in each terminal

### Reset Everything (Delete All Data)
```powershell
# Delete database file
rm server\task_manager.db

# Restart backend (creates fresh database)
cd server
npm run dev
```

---

## 🐛 Troubleshooting

### Issue: "Port 5000 already in use"
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Cannot find module" error
```powershell
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

### Issue: Blank frontend or 404 errors
- Verify backend is running on `http://localhost:5000`
- Check browser console (F12) for error messages
- Try clearing browser cache and reloading

### Issue: Forms not working
- Check browser console for validation errors
- Ensure password has uppercase letter + number (e.g., `Test123`)
- Ensure email format is valid

---

## 💾 Database Information

**Type:** SQLite 3 (file-based, zero setup)  
**Location:** `server/task_manager.db`  
**Tables:** Users, Projects, Tasks, Comments, ProjectMembers  
**Auto-created:** Yes, on first backend start  
**Data Persistence:** Yes, data survives across restarts  

### View Database (SQLite Browser)

If you have SQLite tools installed:
```powershell
sqlite3 server/task_manager.db ".tables"
```

Or use VSCode SQLite extension to browse the database file.

---

## 📝 Environment Variables (Optional)

Create `.env` files to customize (defaults work fine):

**server/.env:**
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
```

**client/.env:**
```
VITE_API_URL=http://localhost:5000
```

---

## 🔐 Test Credentials

**Pre-created after signup:**
- Email: `test@example.com`
- Password: `TestPass123`
- Role: `Admin`

Create additional users by signing up with different emails.

---

## 🚀 API Endpoints (Optional Testing)

Backend API available at `http://localhost:5000/api/`

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**See full API documentation:** See `API.md`

---

## 📚 Project Structure

```
Assi/
├── server/
│   ├── task_manager.db          ← SQLite database (auto-created)
│   ├── models/                  ← Database models
│   ├── controllers/             ← Business logic
│   ├── routes/                  ← API endpoints
│   ├── middleware/              ← Auth & validation
│   ├── config/                  ← Database config
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/              ← React page components
│   │   ├── components/         ← Reusable UI components
│   │   ├── layouts/            ← Layout wrapper
│   │   ├── context/            ← Auth state management
│   │   └── api/                ← HTTP client
│   └── package.json
│
├── QUICKSTART.md               ← This file
├── DEPLOYMENT.md               ← Production deployment guide
└── API.md                      ← API documentation
```

---

## 🎯 Next Steps

### To Use in Production
See `DEPLOYMENT.md` for deploying to:
- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL (Railway managed)

### To Add Features
- **Drag-drop Kanban:** @dnd-kit library already installed
- **Animations:** Framer Motion library ready to use
- **Real-time updates:** Can add WebSocket support
- **File uploads:** Can integrate multer middleware

### To Upgrade to PostgreSQL
1. Install PostgreSQL locally
2. Create a database
3. Update `server/.env`:
   ```
   POSTGRES_URL=postgresql://user:password@localhost:5432/taskdb
   ```
4. Restart backend (will auto-switch to PostgreSQL)

---

## ✨ Your App is Ready!

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:5173  
**Database:** Automatic SQLite (file-based)

All dependencies installed ✓  
Backend configured ✓  
Frontend configured ✓  
Database ready ✓  

**Start building!** 🎉


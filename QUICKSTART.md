# 🚀 Quick Start Guide

## Three Ways to Run Your Application

---

### ⭐ Option 1: Run Both Together (RECOMMENDED)

**Double-click this file:**
```
start-app.bat
```

**What it does:**
- Opens 2 terminal windows automatically
- Window 1: Backend (FastAPI) on port 8001
- Window 2: Frontend (React) on port 3000
- Everything starts together!

**Result:**
- Backend API: https://brainforge-tjls.onrender.com/docs
- Frontend UI: http://localhost:3000

---

### 🔧 Option 2: Run Separately (Manual Control)

**Start Backend:**
```
Double-click: start-backend.bat
```
OR in terminal:
```cmd
cd c:\My_CodeRoom\Rest_full_micro_service
start-backend.bat
```

**Start Frontend:**
```
Double-click: start-frontend.bat
```
OR in terminal:
```cmd
cd c:\My_CodeRoom\Rest_full_micro_service
start-frontend.bat
```

---

### 💻 Option 3: Use VS Code Integrated Terminal

**Terminal 1 (Backend):**
```cmd
cd c:\My_CodeRoom\Rest_full_micro_service
c:\My_CodeRoom\My_venv\Scripts\activate
uvicorn services.user_service.user_main:app --reload --port 8001
```

**Terminal 2 (Frontend):**
```cmd
cd c:\My_CodeRoom\Rest_full_micro_service\frontend
npm run dev
```

---

## 📂 Quick Reference

### Files You Can Double-Click:

| File | Purpose |
|------|---------|
| `start-app.bat` | 🚀 Start BOTH backend & frontend |
| `start-backend.bat` | 🐍 Start only backend (Python/FastAPI) |
| `start-frontend.bat` | ⚛️ Start only frontend (React) |

---

## 🎯 First Time Setup

### Before running, make sure:

1. ✅ **Python virtual environment exists**
   - Location: `c:\My_CodeRoom\My_venv`

2. ✅ **Node.js is installed**
   - Check: `node --version`
   - Download: https://nodejs.org/ (if not installed)

3. ✅ **Frontend dependencies installed**
   - Run once: `cd frontend && npm install`
   - (Or `start-frontend.bat` will do it automatically)

---

## 🌐 Access Points

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main web interface |
| Backend API | https://brainforge-tjls.onrender.com/docs | Swagger documentation |
| Backend Health | https://brainforge-tjls.onrender.com/health | Health check |

---

## 🛑 How to Stop

**If using start-app.bat:**
- Close both terminal windows
- OR press `Ctrl+C` in each window

**If using VS Code terminals:**
- Press `Ctrl+C` in each terminal
- OR click the trash icon to kill terminal

---

## 🐛 Troubleshooting

### Backend won't start?
```cmd
# Check if port 8001 is in use
netstat -ano | findstr :8001

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend won't start?
```cmd
# Install dependencies
cd frontend
npm install

# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### "npm not found" error?
- Install Node.js from https://nodejs.org/
- Restart VS Code after installation

### "uvicorn not found" error?
- Activate virtual environment:
  ```cmd
  c:\My_CodeRoom\My_venv\Scripts\activate
  ```

---

## 📊 Project Structure

```
Rest_full_micro_service/
├── start-app.bat          ← Run both together
├── start-backend.bat      ← Run backend only
├── start-frontend.bat     ← Run frontend only
├── services/
│   └── user_service/      ← FastAPI backend
└── frontend/              ← React frontend
```

---

## 🎓 Development Workflow

### Typical workflow:
1. Double-click `start-app.bat`
2. Wait for both servers to start (10-15 seconds)
3. Open http://localhost:3000 in browser
4. Start coding!
5. Changes auto-reload (both backend & frontend)

### When to restart:
- **Backend**: Environment variables changed
- **Frontend**: package.json dependencies changed
- **Both**: After pulling new code from Git

---

## 📝 Quick Tips

✨ **Backend auto-reloads** when you edit Python files
✨ **Frontend auto-reloads** when you edit React files
✨ **Use Swagger UI** (port 8001/docs) to test API directly
✨ **Check browser console** (F12) for frontend errors
✨ **Check terminal output** for backend errors

---

## 🎉 You're Ready!

**Recommended first run:**
```
1. Double-click: start-app.bat
2. Wait 15 seconds
3. Open: http://localhost:3000
4. Register a new account
5. Login and explore!
```

---

**Need help?** Check README.md for detailed documentation.

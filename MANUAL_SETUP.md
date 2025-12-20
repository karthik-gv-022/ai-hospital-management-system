# Manual Setup Commands - Doctor Management Healthcare Platform

Follow these commands step by step to manually run the project.

## Prerequisites Check

```powershell
# Check Python version (should be 3.9+)
python --version

# Check Node.js version (should be 16+, but v18 or v20 LTS recommended)
node --version

# Check npm version
npm --version
```

**⚠️ IMPORTANT: Node.js Version Compatibility**
- **Recommended**: Node.js v18.20.4 LTS or v20.11.0 LTS
- **Not Recommended**: Node.js v24.x (has compatibility issues with react-scripts)
- If you're using Node.js v24, you may encounter `cross-spawn` errors. Consider downgrading to v18 or v20 LTS.

---

## Step 1: Backend Setup

### 1.1 Navigate to backend directory
```powershell
cd "D:\PROJECT PYTHON\ai-hospital-management-system-main\backend"
```

### 1.2 Create virtual environment
```powershell
python -m venv venv
```

### 1.3 Activate virtual environment
```powershell
.\venv\Scripts\Activate.ps1
```

**Note:** If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 1.4 Install backend dependencies
```powershell
pip install -r requirements.txt
```

### 1.5 Fix bcrypt compatibility (if needed)
```powershell
pip install "bcrypt<4.0.0"
```

### 1.6 Create .env file
```powershell
@"
DATABASE_URL=sqlite:///./hospital.db
SECRET_KEY=my-secret-key-32-chars-long!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_NAME=Doctor Management Healthcare Platform
VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:3000"]
"@ | Out-File -FilePath .env -Encoding utf8
```

### 1.7 Initialize database
```powershell
python scripts\init_db.py
```

### 1.8 Seed database with sample data
```powershell
python scripts\seed_data.py
```

### 1.9 Start backend server
```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** http://localhost:8000

**API Documentation:** http://localhost:8000/docs

---

## Step 2: Frontend Setup (Open a NEW Terminal)

### 2.1 Navigate to frontend directory
```powershell
cd "D:\PROJECT PYTHON\ai-hospital-management-system-main\frontend"
```

### 2.2 Install frontend dependencies
```powershell
npm install
```

**Note:** This may take a few minutes. Wait for it to complete.

### 2.3 Start frontend development server
```powershell
npm start
```

**Frontend will be available at:** http://localhost:3000

**Demo Page:** http://localhost:3000/demo.html

---

## Quick Start Commands (All in One)

### Terminal 1 - Backend:
```powershell
cd "D:\PROJECT PYTHON\ai-hospital-management-system-main\backend"
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```powershell
cd "D:\PROJECT PYTHON\ai-hospital-management-system-main\frontend"
npm start
```

---

## Troubleshooting

### Backend Issues

**If virtual environment activation fails:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**If bcrypt error occurs:**
```powershell
pip install "bcrypt<4.0.0"
```

**If port 8000 is already in use:**
```powershell
# Use a different port
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Issues

**If you get "Cannot find module './lib/parse'" error (Node.js v24 issue):**
```powershell
# Option 1: Use Node.js v18 or v20 LTS (Recommended)
# Download from: https://nodejs.org/
# Or use nvm-windows:
nvm install 18.20.4
nvm use 18.20.4

# Option 2: Try with NODE_OPTIONS
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start

# Option 3: Clean reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm start
```

**If npm install fails:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json, then reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

**If port 3000 is already in use:**
- The app will automatically try port 3001
- Or set environment variable: `$env:PORT=3001`

**If react-scripts is not found:**
```powershell
# Make sure npm install completed successfully
npm install

# If still not found, try:
npm install react-scripts --save
```

---

## Default Login Credentials

- **Admin**: `admin@hospital.com` / `admin123`
- **Doctor 1**: `dr.smith@hospital.com` / `doctor123`
- **Doctor 2**: `dr.johnson@hospital.com` / `doctor123`
- **Doctor 3**: `dr.williams@hospital.com` / `doctor123`
- **Patient 1**: `alice.brown@email.com` / `patient123`
- **Patient 2**: `robert.davis@email.com` / `patient123`
- **Patient 3**: `emily.wilson@email.com` / `patient123`

---

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal

---

## Verification

### Check Backend:
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Or visit in browser
# http://localhost:8000/docs
```

### Check Frontend:
```powershell
# Visit in browser
# http://localhost:3000
```

---

## Project Structure

```
ai-hospital-management-system-main/
├── backend/              # FastAPI backend
│   ├── app/            # Application code
│   ├── scripts/        # Database scripts
│   ├── venv/          # Virtual environment (created)
│   ├── .env           # Environment config (created)
│   └── hospital.db    # SQLite database (created)
└── frontend/           # React frontend
    ├── src/           # Source code
    └── node_modules/  # Dependencies (created)
```


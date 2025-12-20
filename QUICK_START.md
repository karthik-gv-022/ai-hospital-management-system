# Quick Start Guide - Doctor Management Healthcare Platform

This guide will help you get the project running quickly.

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **MySQL 8.0+** OR use SQLite for quick testing
- **Docker & Docker Compose** (optional, recommended)

---

## Option 1: Docker Setup (Recommended - Easiest)

### Step 1: Start all services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Step 2: Initialize database
```bash
# Initialize database tables
docker-compose -f docker-compose.dev.yml exec backend python scripts/init_db.py

# Seed with sample data
docker-compose -f docker-compose.dev.yml exec backend python scripts/seed_data.py
```

### Step 3: Access the application
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Demo Page**: http://localhost:3000/demo.html

### View logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop services
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## Option 2: Manual Setup

### Backend Setup

#### Step 1: Navigate to backend directory
```bash
cd backend
```

#### Step 2: Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Create `.env` file
Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
# For MySQL:
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/hospital_db

# For SQLite (easier for quick testing):
# DATABASE_URL=sqlite:///./hospital.db

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
APP_NAME=Doctor Management Healthcare Platform
VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

**Quick SQLite Setup** (no MySQL needed):
```env
DATABASE_URL=sqlite:///./hospital.db
SECRET_KEY=your-secret-key-here-change-in-production-min-32-chars
```

#### Step 5: Initialize database
```bash
python scripts/init_db.py
python scripts/seed_data.py
```

#### Step 6: Start backend server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

---

### Frontend Setup

#### Step 1: Navigate to frontend directory
```bash
cd frontend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Start development server
```bash
npm start
```

Frontend will be available at: http://localhost:3000

---

## Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: 
  - Email: `admin@hospital.com`
  - Password: `admin123`

- **Doctor**: 
  - Email: `dr.smith@hospital.com`
  - Password: `doctor123`

- **Patient**: 
  - Email: `alice.brown@email.com`
  - Password: `patient123`

---

## Quick Test

### Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Or visit in browser
http://localhost:8000/docs
```

### Test Frontend
Open your browser and navigate to:
- http://localhost:3000 (Main application)
- http://localhost:3000/demo.html (Demo interface)

---

## Troubleshooting

### Backend Issues

1. **Database Connection Error**:
   - Check if MySQL is running (if using MySQL)
   - Verify DATABASE_URL in `.env` file
   - For SQLite, ensure the database file path is correct

2. **Module Not Found**:
   - Make sure virtual environment is activated
   - Run `pip install -r requirements.txt` again

3. **Port Already in Use**:
   - Change port: `uvicorn app.main:app --reload --port 8001`
   - Or stop the process using port 8000

### Frontend Issues

1. **npm install fails**:
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

2. **Port 3000 already in use**:
   - The app will automatically try port 3001
   - Or set PORT environment variable: `set PORT=3001` (Windows) or `export PORT=3001` (macOS/Linux)

3. **API Connection Error**:
   - Ensure backend is running on port 8000
   - Check `proxy` setting in `package.json` (should be `http://localhost:8000`)

### Docker Issues

1. **Container won't start**:
   - Check logs: `docker-compose -f docker-compose.dev.yml logs`
   - Ensure ports 3000, 8000, and 3306 are not in use

2. **Database initialization fails**:
   - Wait a few seconds for MySQL to fully start
   - Check MySQL container logs: `docker-compose -f docker-compose.dev.yml logs mysql`

---

## Next Steps

1. **Explore API Documentation**: Visit http://localhost:8000/docs for interactive API docs
2. **Test Authentication**: Use the default credentials to log in
3. **Create Appointments**: Test the appointment booking system
4. **Try AI Features**: Test doctor recommendations and wait time predictions

---

## Project Structure

```
ai-hospital-management-system/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   ├── scripts/     # Database initialization scripts
│   └── tests/       # Test files
├── frontend/         # React frontend
│   ├── src/         # Source code
│   └── public/      # Static files
└── docker-compose.*.yml  # Docker configurations
```

---

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Check API documentation at http://localhost:8000/docs



@echo off
echo Starting Doctor Management Platform in Development Mode...
echo.
echo This mode provides HOT RELOADING - your code changes will be reflected immediately!
echo.
echo Frontend (with hot reloading): http://localhost:3001
echo Backend API: http://localhost:8000
echo.
docker-compose -f docker-compose.dev.yml up frontend-dev
pause
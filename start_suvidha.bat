@echo off
echo ========================================================
echo         SUVIDHA 2.0 - Complete System Launcher          
echo ========================================================
echo.

echo 1. Seeding 3,400+ Schemes into MongoDB...
cd backend
node seed_all_schemes.js
cd ..

echo.
echo 2. Starting Python ML Engine 2.0 (Port 8000)...
start "SUVIDHA ML Engine" cmd /k "cd ml_service && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo.
echo 3. Starting Express Backend API (Port 5000)...
start "SUVIDHA Express Backend" cmd /k "cd backend && node server.js"

echo.
echo 4. Starting React Frontend (Port 3000)...
start "SUVIDHA React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  SUVIDHA 2.0 services launched in separate windows!
echo  Access App at: http://localhost:3000
echo ========================================================

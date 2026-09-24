@echo off
echo ========================================================
echo   Launching MedRoute Full Stack (Backend, Web, Mobile)
echo ========================================================

echo [1/3] Starting Backend API (Port 8000)...
start "MedRoute Backend (Port 8000)" cmd /k "cd backend && .venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Web Next.js App (Port 3000)...
start "MedRoute Web (Port 3000)" cmd /k "cd web && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Mobile Expo App (Metro Port 8081)...
start "MedRoute Mobile (Metro Port 8081)" cmd /k "cd mobile && npm start"

echo ========================================================
echo   All 3 services launched successfully!
echo   - Backend: http://localhost:8000
echo   - Web:     http://localhost:3000
echo   - Mobile:  http://localhost:8081 (Expo Metro)
echo ========================================================

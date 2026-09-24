Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching MedRoute Full Stack (Backend, Web, Mobile)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd a:\projects\med-route\backend; .\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Sleep -Seconds 2

Write-Host "[2/3] Launching Next.js Web Portal on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd a:\projects\med-route\web; npm run dev"
Start-Sleep -Seconds 2

Write-Host "[3/3] Launching Expo React Native Mobile on Metro 8081..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd a:\projects\med-route\mobile; npm start"

Write-Host "`nAll 3 services launched in dedicated windows!" -ForegroundColor Green
Write-Host "  - Backend API: http://localhost:8000"
Write-Host "  - Web Portal:  http://localhost:3000"
Write-Host "  - Mobile Expo: http://localhost:8081"

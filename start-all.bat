@echo off
echo Starting Smart Recruitment System...
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

start "ML Service" cmd /k "cd ml-service && venv\Scripts\activate && uvicorn app:app --reload --port 8000"
timeout /t 3 /nobreak > nul

start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo All services are starting...
echo Backend: http://localhost:5000
echo ML Service: http://localhost:8000
echo Frontend: http://localhost:3000
echo.

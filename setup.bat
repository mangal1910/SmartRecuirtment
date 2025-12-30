@echo off
echo ========================================
echo Smart Recruitment System - Test Setup
echo ========================================
echo.

echo Step 1: Setting up Python ML Service...
cd ml-service
call venv\Scripts\activate.bat
echo Installing Python packages (this may take a few minutes)...
pip install -r requirements.txt
echo.
echo Downloading Spacy model...
python -m spacy download en_core_web_md
cd ..

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo To start the application, follow these steps:
echo.
echo 1. Start MongoDB (if running locally) or ensure MongoDB Atlas is accessible
echo 2. Open THREE separate terminal windows and run:
echo.
echo    Terminal 1 - Backend:
echo      cd backend
echo      npm run dev
echo.
echo    Terminal 2 - ML Service:
echo      cd ml-service
echo      venv\Scripts\activate
echo      uvicorn app:app --reload --port 8000
echo.
echo    Terminal 3 - Frontend:
echo      cd frontend
echo      npm start
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
pause

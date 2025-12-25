@echo off
echo ========================================
echo   E-Commerce Application Launcher
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/2] Starting Backend (FastAPI)...
echo      Backend will run on: http://localhost:8001
echo.

REM Start backend in new window
start "E-Commerce Backend (Port 8001)" cmd /k "cd /d "%SCRIPT_DIR%" && c:\My_CodeRoom\My_venv\Scripts\activate && uvicorn services.user_service.user_main:app --reload --port 8001"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (React)...
echo      Frontend will run on: http://localhost:3000
echo.

REM Start frontend in new window
start "E-Commerce Frontend (Port 3000)" cmd /k "cd /d "%SCRIPT_DIR%\frontend" && npm run dev"

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8001/docs
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows have been opened:
echo   1. Backend Terminal (FastAPI)
echo   2. Frontend Terminal (React)
echo.
echo Press Ctrl+C in each terminal to stop them.
echo.
pause

@echo off
echo ========================================
echo   Starting FastAPI Backend Services
echo ========================================
echo.

cd /d "%~dp0"

echo Cleaning up old processes...
taskkill /F /IM python.exe >nul 2>&1
echo Waiting for ports to clear...
timeout /t 2 /nobreak

echo.
echo Activating Python virtual environment...
call c:\My_CodeRoom\My_venv\Scripts\activate

echo.
echo Starting API Gateway on port 8000 (in new window)...
echo.
start "API Gateway" cmd /k "cd /d %~dp0 && python main.py"

echo Waiting for gateway to start...
timeout /t 3 /nobreak

echo.
echo Starting User Service on port 8001 (in new window)...
echo.
start "User Service" cmd /k "cd /d %~dp0 && uvicorn services.user_service.user_main:app --host 0.0.0.0 --port 8001"

echo.
echo ========================================
echo   Backend Services Started
echo ========================================
echo   API Gateway:   http://localhost:8000
echo   User Service:  http://localhost:8001/docs
echo   Proxy Status:  http://localhost:8000/health
echo ========================================

@echo off
echo ========================================
echo   Starting FastAPI Backend
echo ========================================
echo.

cd /d "%~dp0"

echo Activating Python virtual environment...
call c:\My_CodeRoom\My_venv\Scripts\activate

echo.
echo Starting User Service on port 8001...
echo API Documentation: http://localhost:8001/docs
echo.

uvicorn services.user_service.user_main:app --reload --port 8001

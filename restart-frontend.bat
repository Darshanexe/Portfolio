@echo off
echo ========================================
echo   Restarting Frontend (Clean Start)
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo [1] Stopping any running dev servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2] Clearing Vite cache...
if exist "node_modules\.vite\" (
    rmdir /s /q "node_modules\.vite"
    echo    ✓ Cache cleared
) else (
    echo    ✓ No cache to clear
)

echo.
echo [3] Starting Vite dev server...
echo    URL: http://localhost:3000
echo    Keep this window open!
echo.

npm run dev

pause

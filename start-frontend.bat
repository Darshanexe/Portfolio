@echo off
echo ========================================
echo   Starting React Frontend
echo ========================================
echo.

cd /d "%~dp0\frontend"

REM Check if npm is available in PATH
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found in PATH!
    echo.
    echo Please either:
    echo 1. Add Node.js to PATH: C:\Program Files\nodejs\
    echo 2. Restart VS Code after adding to PATH
    echo 3. Or install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo.
    echo ========================================
    echo   Installing Dependencies...
    echo   This may take 2-5 minutes.
    echo   Please wait, do NOT close this window!
    echo ========================================
    echo.
    call npm install
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✓ Dependencies installed successfully!
        echo.
    ) else (
        echo.
        echo ✗ Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
)

echo Starting React development server...
echo Frontend will open at: http://localhost:3000
echo.
echo Keep this window open! Press Ctrl+C to stop the server.
echo.

call npm run dev

REM If npm fails, keep window open
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: Failed to start frontend!
    echo ========================================
    echo.
    pause
)

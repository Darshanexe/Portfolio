@echo off
echo ========================================
echo   Frontend Installation Diagnostics
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo [1] Checking current directory...
cd
echo.

echo [2] Checking if package.json exists...
if exist "package.json" (
    echo ✓ package.json found
) else (
    echo ✗ package.json NOT found!
)
echo.

echo [3] Checking if node_modules exists...
if exist "node_modules\" (
    echo ✓ node_modules folder exists
    dir node_modules /b | find /c /v "" > temp.txt
    set /p COUNT=<temp.txt
    del temp.txt
    echo   Contains packages
) else (
    echo ✗ node_modules folder NOT found (needs installation)
)
echo.

echo [4] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js found
    node --version
) else (
    echo ✗ Node.js NOT found in PATH!
)
echo.

echo [5] Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ npm found
    npm --version
) else (
    echo ✗ npm NOT found in PATH!
)
echo.

echo [6] Trying to install dependencies...
echo    This will show you what happens during install.
echo.
pause
echo.

npm install

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.

echo [7] Verifying node_modules...
if exist "node_modules\" (
    echo ✓ node_modules created successfully!
    echo.
    echo Contents:
    dir node_modules /b
) else (
    echo ✗ node_modules still missing!
)

echo.
pause

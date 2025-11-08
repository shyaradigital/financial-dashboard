@echo off
REM Financial Dashboard - Windows Installation Script (Batch)
REM Run this script by double-clicking it

echo ========================================
echo Financial Dashboard - Installation
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found
echo.

REM Check npm
echo Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
npm --version
echo [OK] npm found
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Build application
echo Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build successful
echo.

REM Create desktop shortcut
echo Creating desktop shortcut...
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Financial Dashboard.lnk"
set "TARGET=%CD%"
set "ICON=%CD%\node_modules\electron\dist\electron.exe"

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-NoExit -Command \"cd ''%TARGET%''; npm start\"'; $Shortcut.WorkingDirectory = '%TARGET%'; $Shortcut.Description = 'Financial Dashboard'; $Shortcut.Save()"

echo [OK] Desktop shortcut created
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now:
echo 1. Double-click the desktop shortcut to launch
echo 2. Or run: npm start
echo.
pause


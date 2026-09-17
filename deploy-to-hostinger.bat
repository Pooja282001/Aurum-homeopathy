@echo off
REM Quick Hostinger Backend Deployment Script
REM Usage: Run this script after updating it with your FTP credentials

setlocal enabledelayedexpansion

echo ============================================================
echo  AURUM HOMEOPATHY - HOSTINGER BACKEND DEPLOYMENT SCRIPT
echo ============================================================
echo.

REM Check if FTP tool is available
where ftp >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ FTP command not found. Please use Hostinger File Manager web UI instead.
    echo.
    echo Alternative: Use WinSCP or FileZilla for graphical FTP upload
    echo Download: https://winscp.net or https://filezilla-project.org
    echo.
    pause
    exit /b 1
)

echo 📋 FILES TO UPLOAD:
echo   ✓ backend.php (to /public_html/)
echo   ✓ config.php (to /public_html/)
echo   ✓ api/config.php (to /public_html/api/)
echo   ✓ api/index.php (to /public_html/api/)
echo   ✓ .htaccess (to /public_html/)
echo.

echo 🔧 HOSTINGER FTP CREDENTIALS:
set /p FTP_HOST="Enter FTP Host [46.202.161.61]: " || set FTP_HOST=46.202.161.61
set /p FTP_USER="Enter FTP Username [u154384799]: " || set FTP_USER=u154384799
set /p FTP_PASS="Enter FTP Password: "
set /p FTP_PORT="Enter FTP Port [21]: " || set FTP_PORT=21

echo.
echo 📤 Starting FTP Upload...
echo.

REM Create FTP script file
(
    echo open %FTP_HOST% %FTP_PORT%
    echo %FTP_USER%
    echo %FTP_PASS%
    echo cd public_html
    echo lcd d:\Aurum-homeopathy
    echo binary
    echo put backend.php
    echo put config.php
    echo put .htaccess
    echo mkdir api
    echo cd api
    echo lcd d:\Aurum-homeopathy\api
    echo put config.php
    echo put index.php
    echo put .htaccess
    echo cd ..
    echo quit
) > ftp_upload.txt

REM Execute FTP script
ftp -s:ftp_upload.txt

REM Clean up
del ftp_upload.txt

echo.
echo ✅ Upload Complete!
echo.
echo 🧪 TEST THE DEPLOYMENT:
echo   1. Open: https://aurumhomeopathy.com/backend.php?action=health
echo   2. Expected: JSON response with "ok": true
echo   3. Check browser console for login errors
echo.

pause

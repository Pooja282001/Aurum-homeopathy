@echo off
REM Complete Database Rebuild for Dr. Shelke's Aurum Homeopathy
REM Connects to Hostinger and executes complete schema recreation

echo.
echo ============================================================
echo  COMPLETE DATABASE REBUILD
echo  Hostinger MySQL Database
echo ============================================================
echo.

REM Note: mysql command line tool must be installed and in PATH
REM Download from: https://dev.mysql.com/downloads/mysql/

mysql -h srv1752.hstgr.io -u u154384799_Aurum -pAurum2025 u154384799_Ahc < complete-database-rebuild.sql

if errorlevel 1 (
  echo ERROR: MySQL command failed!
  echo Make sure MySQL command line tools are installed
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  DATABASE REBUILD COMPLETE
echo ============================================================
echo.
pause

@echo off
REM Hostinger FTP Upload Script
REM Replace YOUR_PASSWORD with your actual FTP password

setlocal enabledelayedexpansion

set FTP_HOST=46.202.161.61
set FTP_USER=u15438479
set FTP_PASS=YOUR_PASSWORD_HERE
set FTP_PORT=21

REM Create FTP script
(
    echo open !FTP_HOST! !FTP_PORT!
    echo !FTP_USER!
    echo !FTP_PASS!
    echo binary
    echo cd public_html
    echo mkdir api
    echo put "d:\Aurum-homeopathy\api\index.php" api/index.php
    echo put "d:\Aurum-homeopathy\api\config.php" api/config.php
    echo put "d:\Aurum-homeopathy\api\.htaccess" api/.htaccess
    echo put "d:\Aurum-homeopathy\api\diagnose.php" api/diagnose.php
    echo mkdir dist
    echo mkdir dist\assets
    echo put "d:\Aurum-homeopathy\dist\index.html" dist/index.html
    echo quit
) > ftp_commands.txt

REM Execute FTP commands
ftp -s:ftp_commands.txt

REM Cleanup
del ftp_commands.txt

echo.
echo Upload Complete!
pause

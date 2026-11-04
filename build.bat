@echo off
setlocal
cd /d "%~dp0"
title Build FTI UII - Production
color 0A

echo ======================================================================
echo                  BUILD PRODUCTION - FTI UII WEBSITE
echo ======================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js belum terdeteksi di komputer Anda!
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Menjalankan npm install terlebih dahulu...
    call npm install
)

echo [INFO] Membangun bundle production (npm run build)...
call npm run build

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo [BERHASIL] Build selesai! File siap hosting ada di folder "dist\"
    echo ======================================================================
) else (
    color 0C
    echo.
    echo [ERROR] Terjadi kesalahan saat proses build.
)

echo.
pause

@echo off
setlocal
cd /d "%~dp0"
title FTI UII - Modern React Web App
color 0B

echo ======================================================================
echo          FAKULTAS TEKNOLOGI INDUSTRI - UNIVERSITAS ISLAM INDONESIA
echo               Website Modern (React.js + Tailwind CSS + Vite)
echo ======================================================================
echo.

REM 1. Memeriksa instalasi Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js belum terdeteksi di komputer Anda!
    echo Silakan unduh dan pasang Node.js terlebih dahulu dari: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 2. Memeriksa folder node_modules
if not exist "node_modules\" (
    echo [INFO] Dependensi belum terpasang. Menjalankan npm install...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo.
        echo [ERROR] Terjadi kesalahan saat instalasi npm install.
        pause
        exit /b 1
    )
    echo.
)

REM 3. Menjalankan server development Vite
echo [OK] Menjalankan server lokal...
echo [OK] Browser akan otomatis terbuka di http://localhost:3000
echo.
echo Tekan tombol Ctrl + C jika ingin menghentikan server.
echo ======================================================================
echo.

call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [INFO] Server telah berhenti.
    pause
)

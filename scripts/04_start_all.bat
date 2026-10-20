@echo off
setlocal
REM ============================================================
REM  DMC_V2 Pixel Streaming - one click start
REM   1) signalling server + web page  http://THIS-IP:8080
REM   2) DMC_V2.exe streamer          ws://127.0.0.1:8888
REM
REM  Requires: 01_setup_infra.bat already run,
REM            and a game build with PixelStreaming2 enabled.
REM ============================================================

set "PSROOT=%~dp0.."

if not exist "%PSROOT%\infra\node_modules" (
  echo [ERROR] dependencies missing. Run scripts\01_setup_infra.bat first.
  exit /b 1
)

echo.
echo ============================================================
echo  DMC_V2 pixel streaming - starting
echo ============================================================
echo.

start "DMC_V2 Signalling" cmd /k "cd /d "%PSROOT%\infra" && node signalling-server.mjs"

echo Waiting for signalling server ...
timeout /t 5 /nobreak >nul

call "%~dp003_start_game.bat"

echo.
echo ============================================================
echo  Now running:
echo    player page : http://THIS-IP:8080/
echo    streamer    : ws://THIS-IP:8888
echo.
echo  Local IPv4 addresses:
ipconfig | findstr /i "IPv4"
echo ============================================================
echo.
pause

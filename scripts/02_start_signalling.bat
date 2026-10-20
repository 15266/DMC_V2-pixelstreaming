@echo off
setlocal
REM ============================================================
REM  DMC_V2 Pixel Streaming - Step 2
REM  Start signalling server + web frontend
REM
REM   Player page + player websocket : HTTP_PORT   (8080)
REM   UE streamer connection         : STREAMER_PORT (8888)
REM
REM  Override with environment variables:
REM    set HTTP_PORT=8080
REM    set STREAMER_PORT=8888
REM    set ICE_SERVERS=[{"urls":"stun:stun.example.com:3478"}]
REM ============================================================

set "PSROOT=%~dp0.."
set "INFRA=%PSROOT%\infra"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] node not found. Install Node.js 18+ first.
  exit /b 1
)

if not exist "%INFRA%\node_modules" (
  echo [ERROR] dependencies missing. Run 01_setup_infra.bat first.
  exit /b 1
)

if "%HTTP_PORT%"==""     set "HTTP_PORT=8080"
if "%STREAMER_PORT%"=="" set "STREAMER_PORT=8888"
if "%WEB_ROOT%"==""      set "WEB_ROOT=%PSROOT%\web"
if "%HOME_PAGE%"==""     set "HOME_PAGE=play.html"

echo.
echo ---------------------------------------------------------
echo  Player entry : http://THIS-IP:%HTTP_PORT%/
echo  UE streamer  : ws://THIS-IP:%STREAMER_PORT%
echo ---------------------------------------------------------
echo.

pushd "%INFRA%"
set HTTP_PORT=%HTTP_PORT%
set STREAMER_PORT=%STREAMER_PORT%
set WEB_ROOT=%WEB_ROOT%
set HOME_PAGE=%HOME_PAGE%
node signalling-server.mjs
popd

@echo off
setlocal
REM ============================================================
REM  DMC_V2 Pixel Streaming - Step 1
REM  Install infrastructure dependencies + bundle the frontend
REM  Uses npmmirror, no access to github.com required.
REM ============================================================

set "PSROOT=%~dp0.."
set "INFRA=%PSROOT%\infra"
set "WEBLIB=%PSROOT%\web\lib"
set "REG=https://registry.npmmirror.com"

echo.
echo [1/2] Installing signalling server dependencies ...
pushd "%INFRA%"
call npm install --registry=%REG%
if errorlevel 1 (
  echo [ERROR] npm install failed. Check your network and retry.
  popd
  exit /b 1
)
popd

echo.
echo [2/2] Bundling browser frontend library ...
pushd "%WEBLIB%"
call npm install --registry=%REG%
if errorlevel 1 (
  echo [ERROR] frontend dependency install failed.
  popd
  exit /b 1
)
call npx esbuild entry.mjs --bundle --format=iife --outfile=frontend.js --platform=browser --target=es2020
if errorlevel 1 (
  echo [ERROR] esbuild bundling failed.
  popd
  exit /b 1
)
popd

echo.
echo [OK] Infrastructure ready.
echo     signalling server : %INFRA%
echo     frontend bundle   : %WEBLIB%\frontend.js
echo.
echo Next: run 02_start_signalling.bat
echo.
pause

@echo off
setlocal
REM ============================================================
REM  DMC_V2 Pixel Streaming - Step 3
REM  Launch the packaged game in pixel streaming mode
REM
REM  Default game path: <project>\Packaged\Windows\DMC_V2.exe
REM  Override:          set GAME_EXE=D:\your\path\DMC_V2.exe
REM
REM  Signalling URL:    ws://127.0.0.1:8888
REM  Override:          set PS_URL=ws://203.0.113.10:8888
REM ============================================================

set "PSROOT=%~dp0.."

if "%GAME_EXE%"=="" set "GAME_EXE=%PSROOT%\..\Packaged\Windows\DMC_V2.exe"
if "%PS_URL%"==""   set "PS_URL=ws://127.0.0.1:8888"
if "%RES_X%"==""    set "RES_X=1920"
if "%RES_Y%"==""    set "RES_Y=1080"

if not exist "%GAME_EXE%" (
  echo [ERROR] Game executable not found:
  echo         %GAME_EXE%
  echo         Set GAME_EXE to the correct path.
  exit /b 1
)

echo Game       : %GAME_EXE%
echo Signalling : %PS_URL%
echo Resolution : %RES_X%x%RES_Y%
echo.

REM  UE5.5 PixelStreaming2 flags:
REM    -PixelStreamingSignallingURL  signalling server to connect to
REM    -RenderOffScreen              no local window (required on headless host)
REM    -Unattended                   no local input, server runs headless
REM    -AllowPixelStreamingCommands  allow browser console exec
REM    -ResX/-ResY                   server-side frame size

start "DMC_V2 Streamer" "%GAME_EXE%" ^
  -PixelStreamingSignallingURL="%PS_URL%" ^
  -RenderOffScreen ^
  -Unattended ^
  -AllowPixelStreamingCommands ^
  -ResX=%RES_X% ^
  -ResY=%RES_Y% ^
  -log

echo.
echo Game launched. Wait ~10s for the title screen, then open:
echo    http://THIS-IP:8080/
echo.

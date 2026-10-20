@echo off
setlocal
REM ============================================================
REM  DMC_V2 - repackage with PixelStreaming2 enabled
REM  Blueprint-only project, full RunUAT BuildCookRun.
REM  First PixelStreaming2 build takes roughly 10-30 minutes.
REM ============================================================

if "%UE%"=="" set "UE=E:\UE_5.5"
if "%CLIENTCONFIG%"=="" set "CLIENTCONFIG=Shipping"
set "PROJ=E:\ue_test\mt\DMC_V2\DMC_V2.uproject"
set "OUTDIR=E:\ue_test\mt\DMC_V2\Packaged"

if not exist "%UE%\Engine\Build\BatchFiles\RunUAT.bat" (
  echo [ERROR] RunUAT.bat not found. Set UE to your engine root.
  exit /b 1
)

echo.
echo Engine  : %UE%
echo Project : %PROJ%
echo Config  : %CLIENTCONFIG%
echo Output  : %OUTDIR%
echo Start   : %date% %time%
echo.

call "%UE%\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun ^
  -project="%PROJ%" ^
  -platform=Win64 ^
  -clientconfig=%CLIENTCONFIG% ^
  -cook -build -stage -pak -archive ^
  -archivedirectory="%OUTDIR%" ^
  -nodebuginfo -utf8output

set "RC=%ERRORLEVEL%"
echo.
echo Finish : %date% %time%
echo Exit   : %RC%
echo.

if not "%RC%"=="0" (
  echo [ERROR] Repackage failed. Check the log above.
  exit /b %RC%
)

echo [OK] Build complete: %OUTDIR%\Windows\DMC_V2.exe
echo.
echo Verifying PixelStreaming2 was actually cooked in.
echo NOTE: Shipping is a monolithic build, so the PixelStreaming2 modules are
echo       linked INTO the exe - there are no PixelStreaming*.dll files.
echo       The reliable check is whether the plugin content got staged:
echo.
if exist "%OUTDIR%\Windows\DMC_V2\Samples\PixelStreaming2" (
  echo   [OK] Samples\PixelStreaming2 present - plugin was enabled and cooked.
  dir /b "%OUTDIR%\Windows\DMC_V2\Samples\PixelStreaming2"
) else (
  echo   [WARN] Samples\PixelStreaming2 missing - plugin may NOT be enabled.
  echo          Check the "PixelStreaming2" entry in DMC_V2.uproject.
)
echo.
dir "%OUTDIR%\Windows\DMC_V2\Binaries\Win64\DMC_V2-Win64-Shipping.exe"
echo.
pause

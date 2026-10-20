@echo off
setlocal
REM ===================================================================
REM  Build the release ZIP that goes onto GitHub Releases.
REM  GitHub repo hard-limits a single file to 100 MB, and our package
REM  has a 378 MB .ucas plus a 148 MB .exe -- so the package can NOT be
REM  committed to the repo. It must be attached as a Release asset
REM  (Release assets allow up to 2 GB per file).
REM ===================================================================

if "%~1"=="" (
    set "SRC=E:\ue_test\mt\DMC_V2\Packaged\Windows"
) else (
    set "SRC=%~1"
)

set "OUTDIR=E:\ue_test\mt\DMC_V2\PSDeploy\release"
set "OUTZIP=%OUTDIR%\DMC_V2_Windows_Shipping.zip"

if not exist "%SRC%\DMC_V2.exe" (
    echo [ERROR] not found: %SRC%\DMC_V2.exe
    echo         run scripts\06_repackage.bat first
    exit /b 1
)

if not exist "%OUTDIR%" mkdir "%OUTDIR%"

echo Source : %SRC%
echo Output : %OUTZIP%
echo.
echo Compressing 610 MB, this takes a few minutes ...
echo.

powershell -NoProfile -Command ^
  "$ErrorActionPreference='Stop';" ^
  "if (Test-Path '%OUTZIP%') { Remove-Item '%OUTZIP%' -Force };" ^
  "Compress-Archive -Path '%SRC%\*' -DestinationPath '%OUTZIP%' -CompressionLevel Fastest"

if errorlevel 1 (
    echo [ERROR] compression failed
    exit /b 1
)

echo.
for %%A in ("%OUTZIP%") do echo Done: %%~nxA  %%~zA bytes
echo Path: %OUTZIP%
echo.
echo Next step: attach this file to a GitHub Release (NOT a normal commit).
echo   Repo page -^> Releases -^> Draft a new release -^> upload asset
echo   Or with gh CLI:  gh release create v1.0 "%OUTZIP%"
endlocal

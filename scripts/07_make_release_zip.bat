@echo off
setlocal
REM ===================================================================
REM  Build the release ZIP that goes onto GitHub Releases.
REM  A GitHub repo hard-limits a single file to 100 MB, and our package
REM  contains a 378 MB .ucas plus a 148 MB .exe -- so the package can
REM  NOT be committed to the repo. It must be attached as a Release
REM  asset instead (Release assets allow up to 2 GB per file).
REM ===================================================================

set "SRC=E:\ue_test\mt\DMC_V2\Packaged\Windows"
if not "%~1"=="" set "SRC=%~1"

set "OUTDIR=E:\ue_test\mt\DMC_V2\PSDeploy\release"
set "OUTZIP=%OUTDIR%\DMC_V2_Windows_Shipping.zip"

if not exist "%SRC%\DMC_V2.exe" (
    echo [ERROR] not found: "%SRC%\DMC_V2.exe"
    echo         run scripts\06_repackage.bat first, or pass the package dir as arg 1
    exit /b 1
)

if not exist "%OUTDIR%" mkdir "%OUTDIR%"

echo Source : %SRC%
echo Output : %OUTZIP%
echo.
echo Compressing about 610 MB, this takes a few minutes ...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; if (Test-Path -LiteralPath '%OUTZIP%') { Remove-Item -LiteralPath '%OUTZIP%' -Force }; Compress-Archive -Path '%SRC%\*' -DestinationPath '%OUTZIP%' -CompressionLevel Fastest -Force"

if errorlevel 1 (
    echo.
    echo [ERROR] compression failed
    echo Tip: if it dies from memory pressure on 610 MB, use 7-Zip instead:
    echo      "C:\Program Files\7-Zip\7z.exe" a -tzip -mx1 "%OUTZIP%" "%SRC%\*"
    exit /b 1
)

echo.
for %%A in ("%OUTZIP%") do echo Done: %%~nxA   %%~zA bytes
echo Path: %OUTZIP%
echo.
echo Next step: attach this file to a GitHub Release -- NOT a normal commit.
echo   Web UI : repo -^> Releases -^> Draft a new release -^> upload asset
echo   gh CLI : gh release create v1.0 "%OUTZIP%"
endlocal

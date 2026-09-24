@echo off
title MedRoute Live Presentation & Screen Mirror
echo =====================================================================
echo                MedRoute USB Screen Mirror & Demo Bridge
echo =====================================================================
echo.

REM Resolve scrcpy and adb path from WinGet
where scrcpy >nul 2>nul
if %errorlevel% neq 0 (
    for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\*scrcpy*") do (
        for /d %%S in ("%%D\*scrcpy*") do (
            set "PATH=%%S;%PATH%"
        )
    )
)

echo [1/3] Checking connected Android device over USB...
adb get-state >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo -----------------------------------------------------------------
    echo [!] No authorized Android device detected yet.
    echo.
    echo Step-by-Step setup on your phone:
    echo   1. Connect phone to laptop with a USB cable.
    echo   2. Enable Developer Options:
    echo      Settings -> About Phone -> Tap "Build Number" 7 times.
    echo   3. Enable USB Debugging:
    echo      Settings -> Developer Options -> Turn on "USB Debugging".
    echo   4. On your phone screen, check "Always allow from this computer"
    echo      and tap "OK" / "Allow".
    echo -----------------------------------------------------------------
    echo.
    echo Waiting for you to plug in and authorize the phone...
    adb wait-for-device
    echo [OK] Device connected!
)

echo.
echo [2/3] Setting up USB Network Tunnel (Reverse Port Forwarding)...
adb reverse tcp:8000 tcp:8000
adb reverse tcp:8081 tcp:8081
echo [OK] Tunnel active! The mobile app can now reach the backend at:
echo      http://localhost:8000 and Metro at http://localhost:8081
echo      (Wired USB speed - immune to Wi-Fi drops or guest firewall blocks!)
echo.

echo [3/3] Launching Live Screen Mirror...
echo.
echo =====================================================================
echo Presentation Shortcuts:
echo   - Mouse Click / Scroll : Controls your phone directly from laptop
echo   - Alt + F              : Toggle Fullscreen mode for projector/demo
echo   - Ctrl + O             : Turn off phone screen (keeps laptop display on)
echo   - Ctrl + Shift + V     : Paste laptop clipboard to phone
echo =====================================================================
echo.

scrcpy --always-on-top --window-title "MedRoute Mobile Live Demo" --stay-awake

if %errorlevel% neq 0 (
    echo.
    echo [!] Mirror session ended or encountered an issue.
    pause
)

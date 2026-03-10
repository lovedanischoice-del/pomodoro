@echo off
echo ========================================
echo Bbangmodoro - Quick Update
echo ========================================
echo.

REM 1. 동기화
echo [1/3] Syncing files...
call npm run sync
if errorlevel 1 (
    echo Error: Sync failed
    pause
    exit /b 1
)
echo ✓ Sync complete

echo.
echo [2/3] Files updated in android/app/src/main/assets/public/
echo.

REM 2. 빌드 옵션
echo [3/3] Choose next step:
echo.
echo 1. Test in Android Studio (recommended)
echo 2. Build Debug APK
echo 3. Skip (manual build later)
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Opening Android Studio...
    echo After it opens:
    echo - Wait for Gradle sync
    echo - Click green ▶️ button
    echo.
    start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%~dp0android"
    if errorlevel 1 (
        echo Could not find Android Studio
        echo Please open manually: %~dp0android
        start "" explorer "%~dp0android"
    )
)

if "%choice%"=="2" (
    echo.
    echo Building Debug APK...
    cd android
    call gradlew assembleDebug
    if errorlevel 1 (
        echo Build failed!
        pause
        exit /b 1
    )
    echo.
    echo ✓ APK built successfully!
    echo Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    start "" explorer "app\build\outputs\apk\debug"
)

if "%choice%"=="3" (
    echo.
    echo Skipped. You can build later in Android Studio.
)

echo.
echo ========================================
echo Update process complete!
echo ========================================
pause

@echo off
chcp 65001 >nul
echo ========================================
echo Bbangmodoro - 직접 동기화 도구 (Vite 미사용)
echo ========================================
echo.

REM 1. 빌드 없이 바로 동기화 (www 폴더 내용을 복사)
echo [1/3] Capacitor 동기화 중... (www -> Android)
call npx cap sync android
if errorlevel 1 (
    echo.
    echo [에러] 동기화에 실패했습니다.
    echo 1. 'capacitor.config.json' 파일의 webDir이 "www"인지 확인하세요.
    echo 2. 'www' 폴더 안에 index.html 파일이 있는지 확인하세요.
    pause
    exit /b 1
)
echo ✓ 동기화 완료!

echo.
echo [2/3] 다음 작업 선택:
echo.
echo 1. 안드로이드 스튜디오 열기
echo 2. 즉시 Debug APK 생성 (Gradle 빌드)
echo 3. 종료
echo.

set /p choice="번호 입력 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 안드로이드 스튜디오를 실행합니다...
    start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%~dp0android"
)

if "%choice%"=="2" (
    echo.
    echo APK 빌드 시작... (이 과정은 안드로이드 스튜디오 없이 진행됩니다)
    cd android
    call gradlew.bat assembleDebug
    if errorlevel 1 (
        echo [에러] Gradle 빌드 실패! JAVA_HOME 설정을 확인하세요.
        pause
        exit /b 1
    )
    echo.
    echo ✓ APK 생성 성공!
    start "" explorer "app\build\outputs\apk\debug"
)

if "%choice%"=="3" exit

echo.
echo ========================================
pause
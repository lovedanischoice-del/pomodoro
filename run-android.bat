@echo off
echo ========================================
echo Bbangmodoro - Android Studio 실행
echo ========================================
echo.
echo 1. Android Studio를 실행합니다...
echo 2. 프로젝트 폴더를 엽니다...
echo.

REM Android Studio 경로 (일반적인 설치 경로)
set STUDIO_PATH="C:\Program Files\Android\Android Studio\bin\studio64.exe"

REM Android Studio 실행 시도
if exist %STUDIO_PATH% (
    echo Android Studio를 찾았습니다!
    start "" %STUDIO_PATH% "%~dp0android"
    echo.
    echo Android Studio가 열리면:
    echo 1. Gradle 동기화 완료 대기
    echo 2. 상단의 기기 선택 (에뮬레이터 또는 실제 기기)
    echo 3. 녹색 ▶️ 버튼 클릭
) else (
    echo Android Studio를 찾을 수 없습니다.
    echo.
    echo 수동으로 실행하세요:
    echo 1. Android Studio 실행
    echo 2. "Open" 클릭
    echo 3. 이 경로 선택: %~dp0android
    echo 4. Trust Project 클릭
    echo 5. 녹색 ▶️ 버튼 클릭
    echo.
    echo 프로젝트 폴더를 엽니다...
    start "" explorer "%~dp0android"
)

echo.
pause

# Android Studio 설치 가이드 (Windows)

## 📥 1단계: 다운로드

1. **공식 사이트 접속**
   - https://developer.android.com/studio
   - 녹색 "Download Android Studio" 버튼 클릭

2. **약관 동의**
   - 체크박스 선택
   - "Download Android Studio for Windows" 클릭
   - 파일 크기: 약 1GB

## 💿 2단계: 설치

1. **다운로드한 파일 실행**
   - `android-studio-{version}-windows.exe` 실행

2. **설치 마법사 진행**
   - "Next" 클릭
   - 설치 구성요소 선택 (기본값 유지 권장):
     ✅ Android Studio
     ✅ Android Virtual Device (에뮬레이터)
   - "Next" 클릭

3. **설치 위치 선택**
   - 기본값: `C:\Program Files\Android\Android Studio`
   - 충분한 공간 확인 (최소 8GB 권장)
   - "Next" 클릭

4. **시작 메뉴 폴더**
   - 기본값 유지
   - "Install" 클릭

5. **설치 대기**
   - 약 5-10분 소요

6. **완료**
   - "Start Android Studio" 체크
   - "Finish" 클릭

## ⚙️ 3단계: 초기 설정

1. **설정 가져오기**
   - "Do not import settings" 선택
   - "OK" 클릭

2. **Setup Wizard**
   - "Next" 클릭

3. **Install Type**
   - **"Standard"** 선택 (권장)
   - "Next" 클릭

4. **UI 테마 선택**
   - Light 또는 Darcula (취향에 따라)
   - "Next" 클릭

5. **SDK 구성요소 확인**
   - 다음 항목들이 자동 선택됨:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
   - "Next" 클릭

6. **라이선스 동의**
   - 각 항목 클릭 후 "Accept" 선택
   - "Finish" 클릭

7. **다운로드 및 설치**
   - SDK 및 도구 다운로드 (약 2-3GB)
   - 10-20분 소요 (인터넷 속도에 따라)

8. **완료**
   - "Finish" 클릭

## 🚀 4단계: Bbangmodoro 프로젝트 열기

1. **Android Studio 메인 화면**
   - "Open" 클릭

2. **프로젝트 폴더 선택**
   ```
   e:\바이브코딩\pomodoro\android
   ```
   - 이 폴더를 선택하고 "OK" 클릭

3. **Gradle 동기화 대기**
   - 처음 열 때 자동으로 Gradle 동기화 시작
   - 하단에 진행 상황 표시
   - 약 2-5분 소요

4. **Trust Project**
   - "Trust Project" 클릭

## 📱 5단계: 앱 실행

### 방법 A: 에뮬레이터 사용 (실제 기기 없을 때)

1. **Device Manager 열기**
   - 우측 상단 도구 모음에서 📱 아이콘 클릭
   - 또는 `Tools` → `Device Manager`

2. **가상 기기 생성**
   - "Create Device" 클릭
   - Phone → "Pixel 6" 선택 (권장)
   - "Next" 클릭

3. **시스템 이미지 선택**
   - "Recommended" 탭에서 최신 버전 선택 (예: Tiramisu, API 33)
   - 다운로드 아이콘(⬇️) 클릭하여 다운로드
   - "Next" 클릭

4. **설정 확인**
   - AVD Name: 기본값 유지
   - "Finish" 클릭

5. **앱 실행**
   - 상단 도구 모음에서 생성한 기기 선택
   - 녹색 ▶️ 버튼 클릭
   - 에뮬레이터 부팅 대기 (첫 실행 시 1-2분)
   - 앱이 자동으로 설치되고 실행됨

### 방법 B: 실제 안드로이드 기기 사용

1. **개발자 옵션 활성화**
   - 설정 → 휴대전화 정보
   - "빌드 번호" 7번 연속 탭
   - "개발자 옵션이 활성화되었습니다" 메시지 확인

2. **USB 디버깅 활성화**
   - 설정 → 개발자 옵션
   - "USB 디버깅" 켜기

3. **기기 연결**
   - USB 케이블로 컴퓨터와 연결
   - 휴대폰에 "USB 디버깅 허용" 팝업 → "허용" 탭

4. **Android Studio에서 확인**
   - 상단 도구 모음에서 연결된 기기 확인
   - 녹색 ▶️ 버튼 클릭
   - 앱이 기기에 설치되고 실행됨

## 🔧 문제 해결

### Gradle 동기화 실패
```bash
# Android Studio 터미널에서
cd android
./gradlew clean
```

### SDK 경로 오류
- `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
- SDK 경로 확인 및 필요한 패키지 설치

### 에뮬레이터가 느릴 때
- BIOS에서 가상화(VT-x/AMD-V) 활성화 필요
- 또는 실제 기기 사용 권장

## 📊 시스템 요구사항

### 최소 사양
- OS: Windows 10 (64-bit)
- RAM: 8GB
- 디스크 공간: 8GB (IDE) + 4GB (SDK)
- 화면 해상도: 1280 x 800

### 권장 사양
- RAM: 16GB 이상
- SSD
- 디스크 공간: 20GB 이상

## ✅ 설치 완료 후

프로젝트가 성공적으로 실행되면:
- 🐧 Bbangmodoro 앱이 안드로이드 기기/에뮬레이터에서 실행됨
- 포모도로 타이머, 할 일 목록, 장작 소리 모두 작동
- 오프라인에서도 사용 가능

## 🎓 다음 단계

### APK 빌드 (배포용)
1. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. 빌드 완료 후 "locate" 링크 클릭
3. APK 파일을 다른 기기에 전송하여 설치 가능

### 코드 수정 후 업데이트
```bash
# 1. www 폴더의 파일 수정
# 2. 프로젝트 루트에서
npm run sync

# 3. Android Studio에서 다시 실행 (▶️ 버튼)
```

---

**도움이 필요하면 언제든지 물어보세요!** 🚀

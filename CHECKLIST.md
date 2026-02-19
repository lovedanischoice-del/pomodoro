# 🚀 Bbangmodoro 안드로이드 앱 실행 체크리스트

## ✅ 설치 체크리스트

### 1단계: Android Studio 다운로드 및 설치
- [ ] https://developer.android.com/studio 접속
- [ ] "Download Android Studio" 클릭
- [ ] 약관 동의 및 다운로드 (약 1GB)
- [ ] 설치 파일 실행
- [ ] 설치 마법사 완료 (기본 설정 유지)
- [ ] 예상 시간: 10-15분

### 2단계: Android Studio 초기 설정
- [ ] "Do not import settings" 선택
- [ ] Setup Wizard에서 "Standard" 설치 선택
- [ ] UI 테마 선택 (Light/Darcula)
- [ ] SDK 라이선스 모두 "Accept"
- [ ] SDK 다운로드 완료 대기 (약 2-3GB)
- [ ] 예상 시간: 15-25분

### 3단계: 프로젝트 열기
- [ ] Android Studio 실행
- [ ] "Open" 클릭
- [ ] `e:\바이브코딩\pomodoro\android` 폴더 선택
- [ ] "Trust Project" 클릭
- [ ] Gradle 동기화 완료 대기
- [ ] 예상 시간: 3-5분

### 4단계: 실행 환경 준비

#### 옵션 A: 에뮬레이터 (실제 기기 없을 때)
- [ ] 우측 상단 📱 Device Manager 클릭
- [ ] "Create Device" 클릭
- [ ] "Pixel 6" 선택 → Next
- [ ] 최신 시스템 이미지 다운로드
- [ ] AVD 생성 완료
- [ ] 예상 시간: 5-10분

#### 옵션 B: 실제 안드로이드 기기
- [ ] 휴대폰 설정 → 휴대전화 정보
- [ ] "빌드 번호" 7번 탭 (개발자 옵션 활성화)
- [ ] 설정 → 개발자 옵션 → "USB 디버깅" 켜기
- [ ] USB 케이블로 컴퓨터 연결
- [ ] "USB 디버깅 허용" 팝업 → 허용
- [ ] Android Studio에서 기기 인식 확인

### 5단계: 앱 실행
- [ ] 상단 도구 모음에서 기기 선택 (에뮬레이터 또는 실제 기기)
- [ ] 녹색 ▶️ 버튼 클릭
- [ ] 앱 빌드 및 설치 대기
- [ ] Bbangmodoro 앱 실행 확인! 🎉

## 🎯 빠른 테스트 (Android Studio 없이)

PWA로 먼저 테스트하고 싶다면:

- [ ] 프로젝트 폴더에서 터미널 열기
- [ ] `cd www` 실행
- [ ] `python -m http.server 8000` 실행
- [ ] 모바일 브라우저에서 `http://[컴퓨터IP]:8000` 접속
- [ ] "홈 화면에 추가" 선택
- [ ] PWA로 앱 테스트 완료!

## 📊 총 소요 시간 예상

- **처음 설치**: 약 30-50분
  - Android Studio 설치: 10-15분
  - SDK 다운로드: 15-25분
  - 프로젝트 설정: 5-10분

- **이미 설치되어 있다면**: 약 5분
  - 프로젝트 열기: 3-5분
  - 앱 실행: 1-2분

## 🆘 문제 발생 시

### Gradle 오류
```bash
cd e:\바이브코딩\pomodoro\android
./gradlew clean
```

### 에뮬레이터가 느림
- BIOS에서 가상화(VT-x) 활성화 필요
- 또는 실제 기기 사용 권장

### 기기가 인식 안 됨
- USB 케이블 다시 연결
- USB 디버깅 다시 허용
- 다른 USB 포트 시도

## 📝 참고 문서

- 상세 가이드: `ANDROID_SETUP.md`
- 프로젝트 README: `README.md`

---

**현재 진행 상황:**
- ✅ PWA 기능 추가 완료
- ✅ Capacitor 설정 완료
- ✅ 안드로이드 프로젝트 생성 완료
- ⏳ Android Studio 설치 중...

**다음 단계:** Android Studio 다운로드 페이지가 열렸습니다. 다운로드를 시작하세요!

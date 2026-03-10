# Bbangmodoro 앱 완전 복구 가이드

## 🚨 현재 상태 진단

### 문제점
1. **파일 인코딩 손상**: `stats.js`, `main.js`, `tasks-settings.js` 등의 한글 주석이 깨져서 JavaScript 파싱 오류 발생
2. **네비게이션 작동 불가**: 하단 탭(Timer, Tasks, Stats, Settings) 클릭 시 화면 전환 안 됨
3. **Firebase 로그인 불가**: Google 로그인 버튼 클릭 시 반응 없음

### 원인
- UTF-8 인코딩이 아닌 다른 인코딩으로 파일이 저장되어 브라우저가 코드를 실행하지 못함
- Service Worker 캐시 문제로 오래된 파일이 계속 로드됨

---

## ✅ 해결 방법

### 1단계: 모든 JavaScript 파일 삭제 및 재생성

다음 파일들을 **완전히 삭제**하고 새로 만들어야 합니다:
- `main.js`
- `stats.js`
- `tasks-settings.js`
- `firebase-config.js`

### 2단계: 브라우저 캐시 완전 초기화

1. Chrome 개발자 도구 열기 (F12)
2. Application 탭 → Storage → Clear site data 클릭
3. 브라우저 완전 종료 후 재시작

### 3단계: 서버 재시작

```bash
# 기존 서버 종료 (Ctrl+C)
# 새로 시작
cd e:\바이브코딩\pomodoro
python -m http.server 8000
```

### 4단계: 강력 새로고침

브라우저에서 `http://localhost:8000` 접속 후:
- Windows: `Ctrl + Shift + R`
- 또는 `Shift + F5`

---

## 📁 올바른 파일 구조

```
e:\바이브코딩\pomodoro\
├── index.html              ✅ 메인 HTML (루트에 있어야 함)
├── style.css               ✅ 메인 스타일
├── onboarding.css          ✅ 온보딩 스타일
├── stats.css               ✅ 통계 스타일
├── main.js                 ⚠️ 타이머 로직 (재생성 필요)
├── stats.js                ⚠️ 통계 + 네비게이션 (재생성 필요)
├── tasks-settings.js       ⚠️ 할일 + 설정 (재생성 필요)
├── firebase-config.js      ⚠️ Firebase 설정 (재생성 필요)
├── service-worker.js       ✅ PWA 서비스 워커
├── manifest.json           ✅ PWA 매니페스트
├── icon-192.png            ✅ 앱 아이콘
├── icon-512.png            ✅ 앱 아이콘
└── fire.mp3                ✅ 배경음악
```

**중요**: `www` 폴더는 사용하지 않습니다. 모든 파일은 루트(`e:\바이브코딩\pomodoro\`)에 있어야 합니다.

---

## 🔧 다음 작업

지금부터 **모든 JavaScript 파일을 UTF-8 인코딩으로 완전히 새로 생성**하겠습니다.

각 파일의 역할:
1. **main.js**: 타이머 기능, 할일 목록 (타이머 화면용)
2. **stats.js**: 통계 데이터 + **네비게이션 로직** (가장 중요!)
3. **tasks-settings.js**: 할일 관리 + 설정 화면
4. **firebase-config.js**: Google 로그인 + 클라우드 동기화

---

## 🎯 실행 순서

1. JavaScript 파일 4개 재생성 (자동 진행)
2. 브라우저 캐시 삭제
3. 서버 재시작
4. `http://localhost:8000` 접속
5. 강력 새로고침 (Ctrl+Shift+R)
6. 하단 탭 클릭 테스트

---

## ⚡ 지금 바로 시작합니다

아래 단계를 순서대로 진행하겠습니다.

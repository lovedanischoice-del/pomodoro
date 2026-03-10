# Bbangmodoro 🐧 - 몰입형 포모도로 타이머

장작 타는 소리와 함께하는 PWA + Capacitor 기반 포모도로 타이머 앱

## 🚀 기능

- ⏱️ 20분 작업 / 5분 휴식 포모도로 타이머
- 🔥 장작 타는 소리 배경음 (작업 시간에만 재생)
- ✅ 할 일 목록 관리 (로컬 저장)
- 📱 PWA 지원 (오프라인 작동 가능)
- 🤖 안드로이드 네이티브 앱 지원 (Capacitor)

## 📦 설치 및 실행

### 웹 브라우저에서 실행 (PWA)

1. 웹 서버로 실행:
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server -p 8000
```

2. 브라우저에서 `http://localhost:8000` 접속

3. 모바일에서:
   - Chrome: 메뉴 → "홈 화면에 추가"
   - Safari: 공유 → "홈 화면에 추가"

### 안드로이드 앱으로 빌드

#### 사전 요구사항
- Android Studio 설치
- JDK 17 이상 설치
- Android SDK 설치

#### 빌드 과정

1. **파일 수정 후 동기화**
```bash
# www 폴더에 파일 복사 (수정한 경우)
npm run copy

# 또는 전체 동기화
npm run sync
```

2. **Android Studio에서 열기**
```bash
npm run open:android
```

3. **Android Studio에서:**
   - 프로젝트가 열리면 Gradle 동기화 대기
   - 상단 메뉴에서 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 또는 실제 기기/에뮬레이터에서 바로 실행 (▶️ 버튼)

4. **명령줄에서 직접 실행 (선택사항)**
```bash
# 연결된 안드로이드 기기에서 실행
npm run run:android
```

## 📁 프로젝트 구조

```
pomodoro/
├── www/                    # 웹 앱 소스 (Capacitor가 사용)
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # PWA 오프라인 지원
│   ├── fire.mp3           # 배경음
│   └── icon-*.png         # 앱 아이콘
├── android/               # 안드로이드 네이티브 프로젝트
├── capacitor.config.json  # Capacitor 설정
└── package.json
```

## 🛠️ 개발 워크플로우

1. **웹 파일 수정**: `www/` 폴더의 파일들을 수정
2. **동기화**: `npm run sync` 실행
3. **테스트**: Android Studio에서 실행 또는 `npm run run:android`

## 📝 유용한 명령어

```bash
# Capacitor 동기화 (웹 → 네이티브)
npm run sync

# Android Studio 열기
npm run open:android

# 안드로이드 기기에서 실행
npm run run:android

# 웹 파일만 복사
npm run copy

# Capacitor 업데이트
npm run update
```

## 🎨 커스터마이징

### 타이머 시간 변경
`www/main.js` 파일에서:
```javascript
const WORK_TIME = 20 * 60;  // 20분 (초 단위)
const REST_TIME = 5 * 60;   // 5분 (초 단위)
```

### 색상 테마 변경
`www/style.css` 파일의 CSS 변수 수정:
```css
:root {
  --bg-primary: #0a0e27;
  --accent-work: #ff4d4d;
  --accent-rest: #4da6ff;
  /* ... */
}
```

### 앱 이름/ID 변경
`capacitor.config.json` 파일:
```json
{
  "appId": "com.bbangmodoro.app",
  "appName": "Bbangmodoro"
}
```

## 📱 APK 배포

1. Android Studio에서 `Build` → `Generate Signed Bundle / APK`
2. APK 선택
3. 키 스토어 생성 또는 기존 키 사용
4. Release 빌드 선택
5. 생성된 APK는 `android/app/release/` 폴더에 저장됨

## 🐛 문제 해결

### Service Worker 캐시 문제
브라우저 개발자 도구 → Application → Service Workers → Unregister

### Android 빌드 오류
```bash
cd android
./gradlew clean
cd ..
npm run sync
```

## 📄 라이선스

ISC

---

Made with ❤️ and 🐧

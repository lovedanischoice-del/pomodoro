# 🔄 Bbangmodoro 업데이트 가이드

## 📱 업데이트 방법 비교

### 방법 1: 전통적 APK 재배포

**과정:**
```
코드 수정 → npm run sync → APK 빌드 → 사용자 재설치
```

**장점:**
- ✅ 간단하고 확실함
- ✅ 완전한 제어

**단점:**
- ❌ 사용자 수동 재설치 필요
- ❌ 업데이트 느림

---

### 방법 2: 라이브 업데이트 (Capacitor Live Updates)

**과정:**
```
코드 수정 → 서버 업로드 → 앱 자동 다운로드 → 즉시 적용
```

**장점:**
- ✅ 앱 재설치 불필요
- ✅ 즉시 업데이트
- ✅ 사용자 경험 향상

**단점:**
- ❌ 서버 필요 (무료 옵션 있음)
- ❌ 초기 설정 필요

---

## 🚀 추천 방법: Capacitor Live Updates

### 옵션 A: Capgo (무료 플랜 있음)

**설치:**
```bash
npm install @capgo/capacitor-updater
npx cap sync
```

**설정:**
```javascript
// main.js에 추가
import { CapacitorUpdater } from '@capgo/capacitor-updater';

CapacitorUpdater.notifyAppReady();

// 업데이트 확인
async function checkUpdate() {
  const update = await CapacitorUpdater.download({
    url: 'https://your-server.com/update.zip'
  });
  
  if (update) {
    await CapacitorUpdater.set({ id: update.id });
  }
}
```

**무료 플랜:**
- 월 1,000 업데이트
- 개인 프로젝트에 충분

**웹사이트:** https://capgo.app

---

### 옵션 B: GitHub Pages (완전 무료)

**1. GitHub Pages로 호스팅**

```bash
# www 폴더를 GitHub에 푸시
git init
git add www/*
git commit -m "Update"
git push origin main
```

**2. 앱에서 원격 URL 로드**

`capacitor.config.json` 수정:
```json
{
  "server": {
    "url": "https://your-username.github.io/bbangmodoro",
    "cleartext": true
  }
}
```

**장점:**
- ✅ 완전 무료
- ✅ 즉시 업데이트
- ✅ GitHub에서 버전 관리

**단점:**
- ⚠️ 인터넷 연결 필요 (오프라인 불가)

---

## 💡 추천 워크플로우 (하이브리드)

### 로컬 + 원격 업데이트

**초기 설치:**
- APK에 기본 파일 포함 (오프라인 작동)

**업데이트:**
- 원격 서버에서 최신 버전 확인
- 있으면 다운로드 및 캐시
- 없으면 로컬 파일 사용

**구현:**

```javascript
// main.js에 추가

const UPDATE_URL = 'https://your-server.com/version.json';
const CURRENT_VERSION = '1.0.0';

async function checkForUpdates() {
  try {
    const response = await fetch(UPDATE_URL);
    const data = await response.json();
    
    if (data.version > CURRENT_VERSION) {
      // 업데이트 다운로드
      const confirmed = confirm('새 버전이 있습니다. 업데이트하시겠습니까?');
      if (confirmed) {
        // Service Worker로 캐시 업데이트
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          await registration.update();
          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.log('업데이트 확인 실패 (오프라인 모드)');
    // 로컬 파일 사용
  }
}

// 앱 시작 시 확인
window.addEventListener('load', checkForUpdates);
```

---

## 🎯 실전 업데이트 시나리오

### 시나리오 1: 긴급 버그 수정

```bash
# 1. 코드 수정
vim www/main.js

# 2. 동기화
npm run sync

# 3. 빠른 배포
# - GitHub Pages에 푸시 (즉시 반영)
# - 또는 APK 빌드 (안정적)
```

### 시나리오 2: 새 기능 추가

```bash
# 1. 기능 개발 및 테스트
npm run sync
# Android Studio에서 테스트

# 2. 버전 업데이트
# package.json: "version": "1.1.0"

# 3. APK 빌드 및 배포
# Build → Generate Signed Bundle / APK
```

### 시나리오 3: 디자인 변경

```bash
# 1. CSS 수정
vim www/style.css

# 2. 동기화
npm run sync

# 3. 라이브 업데이트 (서버 사용 시)
# 또는 APK 재빌드
```

---

## 📋 업데이트 체크리스트

### 매 업데이트마다:

```
☐ www/ 폴더 파일 수정
☐ npm run sync 실행
☐ Android Studio에서 테스트
☐ 버전 번호 업데이트 (package.json)
☐ 배포 방법 선택:
  ☐ APK 빌드 (안정적)
  ☐ 라이브 업데이트 (빠름)
☐ 변경사항 문서화 (CHANGELOG.md)
```

---

## 🔧 자동화 스크립트

**업데이트 자동화:**

```bash
# update.bat
@echo off
echo Updating Bbangmodoro...

REM 1. 동기화
call npm run sync

REM 2. 버전 확인
echo Current version:
type package.json | findstr version

REM 3. 빌드 옵션
echo.
echo Choose build option:
echo 1. Test in Android Studio
echo 2. Build Debug APK
echo 3. Build Release APK
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Opening Android Studio...
    call npm run open:android
)

if "%choice%"=="2" (
    echo Building Debug APK...
    cd android
    call gradlew assembleDebug
    echo APK location: android\app\build\outputs\apk\debug\
)

if "%choice%"=="3" (
    echo Building Release APK...
    cd android
    call gradlew assembleRelease
    echo APK location: android\app\build\outputs\apk\release\
)

pause
```

---

## 💰 비용 비교

| 방법 | 비용 | 업데이트 속도 | 사용자 경험 |
|------|------|--------------|------------|
| APK 재배포 | 무료 | 느림 (수동) | 보통 |
| GitHub Pages | 무료 | 빠름 | 좋음 (인터넷 필요) |
| Capgo 무료 | 무료 | 매우 빠름 | 매우 좋음 |
| Capgo 유료 | $10/월 | 매우 빠름 | 매우 좋음 |

---

## 🎓 결론

### 개인/소규모 프로젝트:
→ **APK 재배포** (가장 간단)

### 자주 업데이트하는 앱:
→ **GitHub Pages** (무료 + 빠름)

### 프로덕션 앱:
→ **Capgo** (전문적 + 안정적)

---

**지금은 APK 재배포로 시작하고, 나중에 필요하면 라이브 업데이트를 추가하세요!**

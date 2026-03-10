# 🚀 빠른 시작 가이드 - Android Studio에서 실행

## ✅ 설치 완료! 다음 단계:

### 1️⃣ Android Studio 실행
- 시작 메뉴 → "Android Studio" 검색 → 실행

### 2️⃣ 프로젝트 열기
**방법 A: Android Studio에서**
1. "Open" 버튼 클릭
2. 이 경로 선택: `e:\바이브코딩\pomodoro\android`
3. "OK" 클릭

**방법 B: 파일 탐색기에서**
1. `open-android.bat` 파일 더블클릭
2. 열린 폴더에서 우클릭 → "Open Folder as Android Studio Project"
   (이 옵션이 없다면 방법 A 사용)

### 3️⃣ Trust Project
- "Trust Project" 팝업 → 클릭
- Gradle 동기화 시작 (2-5분 대기)

### 4️⃣ 실행 환경 선택

#### 옵션 A: 에뮬레이터 (가상 기기)
1. 우측 상단 📱 아이콘 클릭 (Device Manager)
2. "Create Device" 클릭
3. "Pixel 6" 선택 → Next
4. "Tiramisu" (API 33) 선택 → 다운로드 (있다면)
5. Next → Finish
6. 생성 완료!

#### 옵션 B: 실제 안드로이드 기기
1. **휴대폰 설정:**
   - 설정 → 휴대전화 정보
   - "빌드 번호" 7번 연속 탭
   - 설정 → 개발자 옵션 → "USB 디버깅" ON

2. **연결:**
   - USB 케이블로 컴퓨터 연결
   - 휴대폰에 "USB 디버깅 허용" 팝업 → "허용"

### 5️⃣ 앱 실행! 🎉
1. 상단 도구 모음에서 기기 선택 (에뮬레이터 또는 실제 기기)
2. 녹색 ▶️ 버튼 클릭
3. 빌드 및 설치 대기 (첫 실행 시 2-3분)
4. **Bbangmodoro 앱이 실행됩니다!** 🐧

---

## 🎯 화면 구성 (Android Studio)

```
┌─────────────────────────────────────────────────┐
│ File  Edit  View  ...                    [기기▼] [▶️] │  ← 여기서 실행!
├─────────────────────────────────────────────────┤
│ Project                                         │
│ ├─ app                                          │
│ ├─ Gradle Scripts                               │
│ └─ ...                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  (코드 편집 영역)                                │
│                                                 │
├─────────────────────────────────────────────────┤
│ Build: Syncing...  [진행 상황]                   │  ← 동기화 확인
└─────────────────────────────────────────────────┘
```

---

## 🔧 문제 해결

### Gradle 동기화 실패
1. 상단 메뉴: `File` → `Invalidate Caches` → `Invalidate and Restart`
2. 또는 터미널에서:
```bash
cd e:\바이브코딩\pomodoro\android
.\gradlew clean
```

### 기기가 안 보임
- **에뮬레이터**: Device Manager에서 생성 확인
- **실제 기기**: USB 디버깅 다시 허용, 케이블 재연결

### 빌드 오류
1. `Build` → `Clean Project`
2. `Build` → `Rebuild Project`

---

## 📱 실행 후 확인사항

앱이 실행되면 다음을 확인하세요:

✅ **타이머 기능**
- START 버튼 클릭 → 타이머 시작
- 20:00부터 카운트다운
- 🔥 장작 소리 재생

✅ **할 일 목록**
- 입력창에 할 일 입력
- Enter 또는 + 버튼으로 추가
- 체크박스로 완료 표시
- ✕ 버튼으로 삭제

✅ **PWA 기능**
- 오프라인에서도 작동
- 홈 화면에 추가 가능

---

## 🎨 코드 수정 후 업데이트

1. **웹 파일 수정** (`www/` 폴더)
   - `www/index.html`
   - `www/style.css`
   - `www/main.js`

2. **동기화**
   ```bash
   npm run sync
   ```

3. **Android Studio에서 재실행**
   - 녹색 ▶️ 버튼 다시 클릭

---

## 📦 APK 빌드 (배포용)

앱을 다른 기기에 설치하고 싶다면:

1. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. 빌드 완료 후 "locate" 링크 클릭
3. APK 파일 위치: `android\app\build\outputs\apk\debug\app-debug.apk`
4. 이 파일을 다른 기기로 전송하여 설치

---

## 🎓 유용한 단축키

- **실행**: `Shift + F10`
- **빌드**: `Ctrl + F9`
- **프로젝트 동기화**: `Ctrl + Alt + Y`
- **검색**: `Ctrl + Shift + F`

---

## 📞 도움이 필요하면

1. `ANDROID_SETUP.md` - 상세 설치 가이드
2. `README.md` - 전체 프로젝트 문서
3. `CHECKLIST.md` - 단계별 체크리스트

---

**현재 상태:**
✅ Android Studio 설치 완료
✅ 프로젝트 폴더 열림
⏳ Android Studio에서 프로젝트 열기 대기 중...

**다음:** Android Studio를 실행하고 `e:\바이브코딩\pomodoro\android` 폴더를 여세요!

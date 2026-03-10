# 📱 안드로이드 앱 실행 가이드

## 🚀 빠른 시작 (3단계)

### 1️⃣ Android Studio 열기

**방법 A: 자동 실행**
```
run-android.bat 파일을 더블클릭
```

**방법 B: 수동 실행**
1. Android Studio 실행
2. "Open" 클릭
3. `e:\바이브코딩\pomodoro\android` 폴더 선택
4. "Trust Project" 클릭

---

### 2️⃣ 실행 환경 준비

#### 옵션 A: 에뮬레이터 (가상 기기)

1. **Device Manager 열기**
   - 우측 상단 📱 아이콘 클릭
   - 또는 `Tools` → `Device Manager`

2. **가상 기기 생성** (없다면)
   - "Create Device" 클릭
   - "Pixel 6" 선택 → Next
   - "Tiramisu" (API 33) 또는 최신 버전 선택
   - 다운로드 (처음이면) → Next → Finish

3. **에뮬레이터 실행**
   - 생성된 기기 옆 ▶️ 버튼 클릭
   - 부팅 대기 (1-2분)

#### 옵션 B: 실제 안드로이드 기기

1. **개발자 옵션 활성화**
   ```
   설정 → 휴대전화 정보 → "빌드 번호" 7번 연속 탭
   ```

2. **USB 디버깅 활성화**
   ```
   설정 → 개발자 옵션 → "USB 디버깅" ON
   ```

3. **기기 연결**
   - USB 케이블로 컴퓨터 연결
   - 휴대폰에 "USB 디버깅 허용" 팝업 → "허용"

---

### 3️⃣ 앱 실행! 🎉

1. **상단 도구 모음에서 기기 선택**
   - 에뮬레이터 또는 연결된 실제 기기

2. **녹색 ▶️ 버튼 클릭**
   - 또는 `Shift + F10`

3. **빌드 및 설치 대기**
   - 첫 실행: 2-5분
   - 이후 실행: 30초-1분

4. **앱 실행 확인!**
   - Bbangmodoro 앱이 기기에서 실행됨
   - 네온 그라데이션 타이머 확인
   - START 버튼으로 테스트

---

## 🎯 화면 구성 (Android Studio)

```
┌─────────────────────────────────────────────────┐
│ File  Edit  View  ...          [Pixel 6 ▼] [▶️] │  ← 여기!
├─────────────────────────────────────────────────┤
│ Project                                         │
│ ├─ app                                          │
│ │  ├─ manifests                                 │
│ │  ├─ java                                      │
│ │  └─ res                                       │
│ └─ Gradle Scripts                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  (코드 편집 영역)                                │
│                                                 │
├─────────────────────────────────────────────────┤
│ Build: BUILD SUCCESSFUL in 23s  ✓               │
└─────────────────────────────────────────────────┘
```

---

## 🔧 문제 해결

### Gradle 동기화 실패
```
File → Invalidate Caches → Invalidate and Restart
```

### 기기가 안 보임
- **에뮬레이터**: Device Manager에서 생성 확인
- **실제 기기**: 
  - USB 디버깅 다시 허용
  - 케이블 재연결
  - 다른 USB 포트 시도

### 빌드 오류
```
Build → Clean Project
Build → Rebuild Project
```

### "SDK not found" 오류
```
File → Settings → Appearance & Behavior → System Settings → Android SDK
→ SDK 경로 확인 및 필요한 패키지 설치
```

---

## 📦 APK 파일 만들기 (배포용)

앱을 다른 기기에 설치하고 싶다면:

### 1️⃣ Debug APK (테스트용)
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```
- 위치: `android\app\build\outputs\apk\debug\app-debug.apk`
- 이 파일을 다른 기기로 전송하여 설치 가능

### 2️⃣ Release APK (배포용)
```
Build → Generate Signed Bundle / APK
→ APK 선택
→ 키 스토어 생성 (처음이면)
→ Release 선택
→ 빌드
```
- 위치: `android\app\release\app-release.apk`
- Play 스토어 업로드 또는 직접 배포 가능

---

## 🔄 코드 수정 후 업데이트

웹 파일(`www/` 폴더)을 수정했다면:

### 1️⃣ 동기화
```bash
npm run sync
```

### 2️⃣ Android Studio에서 재실행
- 녹색 ▶️ 버튼 다시 클릭
- 또는 `Shift + F10`

---

## 💡 유용한 단축키

- **실행**: `Shift + F10`
- **빌드**: `Ctrl + F9`
- **프로젝트 동기화**: `Ctrl + Alt + Y`
- **검색**: `Ctrl + Shift + F`
- **터미널 열기**: `Alt + F12`

---

## 📱 실행 후 확인사항

앱이 실행되면:

✅ **네온 그라데이션 타이머** - 오렌지→핑크→보라  
✅ **START 버튼** - 타이머 시작  
✅ **20분 작업 → 5분 휴식** - 자동 전환  
✅ **"띵" 알림음** - 세션 완료 시  
✅ **할 일 목록** - 추가/삭제/완료 표시  
✅ **장작 소리** - 작업 시간에만 재생  

---

## 🎓 다음 단계

### APK 공유
1. `app-debug.apk` 파일을 다른 기기로 전송
2. 기기에서 파일 열기
3. "출처를 알 수 없는 앱 설치" 허용
4. 설치 완료!

### Play 스토어 배포
1. Release APK 생성
2. Google Play Console 계정 생성
3. 앱 등록 및 업로드
4. 심사 후 배포

---

**지금 바로 `run-android.bat` 파일을 더블클릭하여 시작하세요!** 🚀

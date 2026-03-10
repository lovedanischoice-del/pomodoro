# Android Studio Layout을 웹으로 변환하는 방법

## 📋 방법 1: XML 레이아웃 파일 공유

1. **XML 파일 위치:**
   - Android Studio 프로젝트의 `res/layout/` 폴더
   - 예: `activity_main.xml`

2. **XML 파일을 보내주시면:**
   - 제가 HTML/CSS로 변환해드립니다
   - 동일한 레이아웃을 웹으로 재현

3. **필요한 파일:**
   - `res/layout/*.xml` - 레이아웃 파일
   - `res/values/colors.xml` - 색상 정의
   - `res/values/strings.xml` - 텍스트 내용
   - `res/drawable/` - 이미지/아이콘 (있다면)

---

## 📋 방법 2: 스크린샷 공유

1. **Android Studio Layout Editor에서:**
   - Design 탭에서 레이아웃 보기
   - 스크린샷 캡처

2. **스크린샷을 보내주시면:**
   - 제가 HTML/CSS로 재현해드립니다
   - 비슷한 디자인으로 구현

---

## 📋 방법 3: 직접 설명

디자인의 주요 요소를 설명해주시면:
- 화면 구성 (헤더, 본문, 버튼 위치 등)
- 색상 테마
- 주요 기능
- 참고 이미지 (있다면)

제가 처음부터 디자인해드립니다.

---

## 🔄 변환 프로세스

```
Android XML Layout
        ↓
   [분석 및 변환]
        ↓
HTML + CSS + JavaScript
        ↓
   www/ 폴더에 적용
        ↓
   npm run sync
        ↓
   Android 앱으로 빌드
```

---

## 📤 파일 공유 방법

### 방법 A: 파일 내용 복사
```
1. Android Studio에서 XML 파일 열기
2. 전체 내용 복사 (Ctrl+A, Ctrl+C)
3. 여기에 붙여넣기
```

### 방법 B: 파일 경로 알려주기
```
예: e:\내프로젝트\app\src\main\res\layout\activity_main.xml
```

제가 파일을 읽어서 변환해드립니다.

---

## 💡 예시

**만약 이런 XML이 있다면:**
```xml
<LinearLayout>
    <TextView text="Hello" />
    <Button text="Click" />
</LinearLayout>
```

**이렇게 변환됩니다:**
```html
<div class="container">
    <h1>Hello</h1>
    <button>Click</button>
</div>
```

---

**어떤 방법이 편하신가요?**
1. XML 파일 공유
2. 스크린샷 공유
3. 디자인 설명
4. 파일 경로 알려주기

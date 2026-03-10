// 캐시 이름 설정 (앱 업데이트 시 이 이름을 변경하세요)
const CACHE_NAME = 'bbangmodoro-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
    // 뺑수님이 사용하는 장작 소리 파일이나 CSS, JS 파일 경로도 추가하면 좋습니다.
];

// 서비스 워커 설치: 필수 리소스 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// fetch 이벤트: 오프라인에서도 작동하도록 지원 (주소창 제거 필수 조건)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
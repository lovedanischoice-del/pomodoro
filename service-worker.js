const CACHE_NAME = 'bbangmodoro-v4-force-reset-' + new Date().getTime();
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './onboarding.css',
    './stats.css',
    './main.js',
    './stats.js',
    './tasks-settings.js',
    './firebase-config.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // 즉시 활성화
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 이전 캐시 무조건 삭제
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            return self.clients.claim(); // 모든 클라이언트 즉시 제어
        })
    );
});

self.addEventListener('fetch', event => {
    // 캐시 우선, 실패 시 네트워크
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});


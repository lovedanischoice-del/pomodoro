// ============================================
// i18n — 다국어 지원 모듈
// 추후 언어 추가: messages 객체에 새 키 추가만 하면 됨
// ============================================

(function () {
    'use strict';

    const messages = {
        ko: {
            // 공통
            'common.min': '분',
            'common.hrs': '시간',
            'common.days': '일',
            'common.times': '회',
            'common.cancel': '취소',
            'common.save': '저장',
            'common.select': '선택',
            'common.loading': '로딩 중...',
            'common.on': 'ON',
            'common.off': 'OFF',

            // 타이머 화면
            'status.work': 'WORK',
            'status.rest': 'REST',
            'status.longRest': 'LONG REST',
            'timeSub.work': 'WORK SESSION',
            'timeSub.rest': 'REST BREAK',
            'timeSub.longRest': 'LONG BREAK ☕',
            'btn.start': 'START',
            'btn.pause': 'PAUSE',
            'btn.reset': 'RESET',
            'btn.schedule': '⏰ 예약',

            // 스트릭 배너
            'streak.days': '연속 일수',
            'streak.sessions': '오늘 세션',
            'streak.level': '레벨',
            'streak.xpNext': '다음 레벨까지 {n}세션',
            'streak.xpMax': '🏆 MAX 레벨',

            // 레벨 칭호
            'level.1': '🌱 새싹',
            'level.2': '🔥 불꽃',
            'level.3': '⚡ 번개',
            'level.4': '💎 다이아',
            'level.5': '👑 전설',
            'level.6': '🚀 우주인',

            // 네비게이션
            'nav.timer': 'Timer',
            'nav.tasks': 'Tasks',
            'nav.stats': 'Stats',
            'nav.ranks': 'Ranks',
            'nav.items': 'Items',
            'nav.settings': 'Settings',

            // 통계
            'stats.title': '집중 기록',
            'stats.todaySessions': '오늘 세션',
            'stats.focusTime': '집중 시간',
            'stats.streak': '연속 일수',
            'stats.weeklyTitle': 'Weekly Summary',
            'stats.totalFocus': 'Total Focus Time',
            'stats.weeklyChart': 'Weekly Focus Sessions',
            'stats.monthlyInsights': 'Monthly Insights',

            // Tasks
            'tasks.title': 'My Tasks',
            'tasks.placeholder': '새로운 할 일 추가...',
            'tasks.filterAll': 'All',
            'tasks.filterActive': 'Active',
            'tasks.filterDone': 'Completed',
            'tasks.clearDone': '완료 항목 삭제',

            // Settings
            'settings.title': 'Settings',
            'settings.timer': '⏱️ Timer Settings',
            'settings.work': '집중 시간 (분)',
            'settings.rest': '휴식 시간 (분)',
            'settings.autoStart': '자동 시작',
            'settings.flowmodoro': '초몰입 연장 (Flowmodoro)',
            'settings.dailyGoal': '하루 목표 집중 시간',
            'settings.dailyUnit': '시간 (0=없음)',
            'settings.appearance': '🎨 Appearance',
            'settings.theme': '앱 테마',
            'settings.sound': '🔊 Sound Settings',
            'settings.bgSound': '배경음 켜기',
            'settings.volume': '볼륨',
            'settings.bellSound': '알림음',
            'settings.data': '💾 Data',
            'settings.export': 'Export Data',
            'settings.import': 'Import Data',
            'settings.cloudSync': '☁️ Cloud Sync',
            'settings.loginGoogle': 'Google 로그인',
            'settings.bodyDouble': '🐧 바디더블 설정',
            'settings.anonymous': '익명(펭귄)으로 참여',
            'settings.autoJoin': '타이머 시작 시 자동 참여',
            'settings.ai': '🤖 AI 브릿지 (Gemini)',
            'settings.clearData': 'Clear All Data',
            'settings.language': '🌐 언어 / Language',
            'settings.about': 'ℹ️ About',
            'settings.aboutDesc': '장작 소리와 함께하는 몰입형 포모도로 타이머',

            // 하루 목표
            'goal.label': '오늘 목표',

            // 시작 예약 모달
            'schedule.title': '⏰ 시작 예약',
            'schedule.nowTitle': '지금 바로 시작',
            'schedule.nowDesc': '타이머를 즉시 시작합니다',
            'schedule.laterTitle': '15분 뒤에 시작',
            'schedule.laterDesc': '알람 후 5·4·3·2·1 카운트다운 진입',
            'schedule.cancel': '취소',
            'schedule.badgeSuffix': '후 시작',

            // 토스트 / 알림
            'notif.work': '🍅 집중 시간! (세션 #{n})',
            'notif.longRest': '☕ 긴 휴식! 15분',
            'notif.rest': '😌 휴식 시간!',
        },

        en: {
            // 공통
            'common.min': 'min',
            'common.hrs': 'hrs',
            'common.days': 'd',
            'common.times': '',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.select': 'Select',
            'common.loading': 'Loading...',
            'common.on': 'ON',
            'common.off': 'OFF',

            // 타이머 화면
            'status.work': 'WORK',
            'status.rest': 'REST',
            'status.longRest': 'LONG REST',
            'timeSub.work': 'WORK SESSION',
            'timeSub.rest': 'REST BREAK',
            'timeSub.longRest': 'LONG BREAK ☕',
            'btn.start': 'START',
            'btn.pause': 'PAUSE',
            'btn.reset': 'RESET',
            'btn.schedule': '⏰ Reserve',

            // 스트릭 배너
            'streak.days': 'Streak Days',
            'streak.sessions': 'Today',
            'streak.level': 'Level',
            'streak.xpNext': '{n} sessions to next level',
            'streak.xpMax': '🏆 MAX Level',

            // 레벨 칭호
            'level.1': '🌱 Sprout',
            'level.2': '🔥 Flame',
            'level.3': '⚡ Thunder',
            'level.4': '💎 Diamond',
            'level.5': '👑 Legend',
            'level.6': '🚀 Astronaut',

            // 네비게이션
            'nav.timer': 'Timer',
            'nav.tasks': 'Tasks',
            'nav.stats': 'Stats',
            'nav.ranks': 'Ranks',
            'nav.items': 'Items',
            'nav.settings': 'Settings',

            // 통계
            'stats.title': 'Focus Statistics',
            'stats.todaySessions': 'Today Sessions',
            'stats.focusTime': 'Focus Time',
            'stats.streak': 'Streak Days',
            'stats.weeklyTitle': 'Weekly Summary',
            'stats.totalFocus': 'Total Focus Time',
            'stats.weeklyChart': 'Weekly Focus Sessions',
            'stats.monthlyInsights': 'Monthly Insights',

            // Tasks
            'tasks.title': 'My Tasks',
            'tasks.placeholder': 'Add a new task...',
            'tasks.filterAll': 'All',
            'tasks.filterActive': 'Active',
            'tasks.filterDone': 'Completed',
            'tasks.clearDone': 'Clear Completed',

            // Settings
            'settings.title': 'Settings',
            'settings.timer': '⏱️ Timer Settings',
            'settings.work': 'Work Duration (min)',
            'settings.rest': 'Rest Duration (min)',
            'settings.autoStart': 'Auto-start next session',
            'settings.flowmodoro': 'Flow Extension (Flowmodoro)',
            'settings.dailyGoal': 'Daily Focus Goal',
            'settings.dailyUnit': 'hrs (0=off)',
            'settings.appearance': '🎨 Appearance',
            'settings.theme': 'App Theme',
            'settings.sound': '🔊 Sound Settings',
            'settings.bgSound': 'Background Sound',
            'settings.volume': 'Volume',
            'settings.bellSound': 'Notification Sound',
            'settings.data': '💾 Data',
            'settings.export': 'Export Data',
            'settings.import': 'Import Data',
            'settings.cloudSync': '☁️ Cloud Sync',
            'settings.loginGoogle': 'Login with Google',
            'settings.bodyDouble': '🐧 Body Double',
            'settings.anonymous': 'Join as Anonymous (Penguin)',
            'settings.autoJoin': 'Auto-join on timer start',
            'settings.ai': '🤖 AI Bridge (Gemini)',
            'settings.clearData': 'Clear All Data',
            'settings.language': '🌐 Language',
            'settings.about': 'ℹ️ About',
            'settings.aboutDesc': 'Immersive Pomodoro Timer with campfire sounds',

            // 하루 목표
            'goal.label': 'Today\'s Goal',

            // 시작 예약 모달
            'schedule.title': '⏰ Schedule Start',
            'schedule.nowTitle': 'Start Now',
            'schedule.nowDesc': 'Start the timer immediately',
            'schedule.laterTitle': 'Start in 15 min',
            'schedule.laterDesc': 'Alarm → 5·4·3·2·1 countdown then start',
            'schedule.cancel': 'Cancel',
            'schedule.badgeSuffix': 'until start',

            // 토스트 / 알림
            'notif.work': '🍅 Work time! (Session #{n})',
            'notif.longRest': '☕ Long break! 15 minutes',
            'notif.rest': '😌 Rest time!',
        }
    };

    // ─── 핵심 함수 ───────────────────────────────────
    function getLang() {
        return localStorage.getItem('appLang') || 'ko';
    }

    function setLang(lang) {
        if (!messages[lang]) return;
        localStorage.setItem('appLang', lang);
        apply(lang);
        updateLangButtons(lang);
    }

    /**
     * 번역값 반환. {n} 플레이스홀더 지원.
     * @param {string} key
     * @param {Object} [vars] - { n: 값 } 형태
     */
    function t(key, vars) {
        const lang = getLang();
        let str = (messages[lang] && messages[lang][key]) || (messages['ko'][key]) || key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                str = str.replace(`{${k}}`, v);
            });
        }
        return str;
    }

    /**
     * DOM 전체에 번역 적용.
     * data-i18n="키" → textContent 교체
     * data-i18n-placeholder="키" → placeholder 교체
     */
    function apply(lang) {
        if (!messages[lang]) return;
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = messages[lang][key] || messages['ko'][key] || key;
            el.textContent = val;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = messages[lang][key] || messages['ko'][key] || key;
            el.placeholder = val;
        });

        // 동적으로 갱신이 필요한 요소들
        _refreshDynamic();
    }

    function _refreshDynamic() {
        // 스트릭/레벨 배너 라벨 (data-i18n 적용 후 추가 새로고침)
        if (window.statsManager && typeof window.statsManager.updateTodayCards === 'function') {
            window.statsManager.updateTodayCards();
        }
        // schedule 모달 텍스트 (이미 DOM에 있으면)
        const sTitle = document.querySelector('#scheduleOverlay h3');
        if (sTitle) sTitle.textContent = t('schedule.title');
        const nowTitle = document.querySelector('.schedule-choice-btn.now-btn .sch-btn-title');
        if (nowTitle) nowTitle.textContent = t('schedule.nowTitle');
        const nowDesc = document.querySelector('.schedule-choice-btn.now-btn .sch-btn-desc');
        if (nowDesc) nowDesc.textContent = t('schedule.nowDesc');
        const laterTitle = document.querySelector('.schedule-choice-btn.later-btn .sch-btn-title');
        if (laterTitle) laterTitle.textContent = t('schedule.laterTitle');
        const laterDesc = document.querySelector('.schedule-choice-btn.later-btn .sch-btn-desc');
        if (laterDesc) laterDesc.textContent = t('schedule.laterDesc');
        const cancelBtn = document.querySelector('.schedule-cancel-btn');
        if (cancelBtn) cancelBtn.textContent = t('schedule.cancel');
    }

    function updateLangButtons(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // ─── 초기화 ───────────────────────────────────────
    function init() {
        const lang = getLang();
        apply(lang);
        updateLangButtons(lang);

        // 언어 버튼 클릭 이벤트 위임
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (btn && btn.dataset.lang) {
                setLang(btn.dataset.lang);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    // 전역 노출
    window.i18n = { t, setLang, getLang, apply };
    window.t = t; // 단축 헬퍼
})();

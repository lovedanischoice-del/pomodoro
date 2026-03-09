// ==============================================
// Statistics Manager and Navigation Logic
// ==============================================

class StatsManager {
    constructor() {
        this.sessions = this.loadSessions();
    }

    loadSessions() {
        const saved = localStorage.getItem('focusSessions');
        return saved ? JSON.parse(saved) : [];
    }

    saveSessions() {
        localStorage.setItem('focusSessions', JSON.stringify(this.sessions));
        if (window.saveToFirestore) {
            window.saveToFirestore('sessions', this.sessions);
        }
    }

    addSession(duration, type = 'work') {
        const session = {
            date: new Date().toISOString(),
            duration: duration,
            type: type
        };
        this.sessions.push(session);
        this.saveSessions();
        this.updateStats();
    }

    getWeeklyStats() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekSessions = this.sessions.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate >= weekAgo && s.type === 'work';
        });

        const dayStats = {
            'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0,
            'Fri': 0, 'Sat': 0, 'Sun': 0
        };

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        weekSessions.forEach(session => {
            const date = new Date(session.date);
            const dayName = dayNames[date.getDay()];
            dayStats[dayName] += session.duration;
        });

        const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
            total: { hours, minutes },
            daily: dayStats
        };
    }

    getMonthlyStats() {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const monthSessions = this.sessions.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate >= monthAgo && s.type === 'work';
        });

        const dateStats = {};
        monthSessions.forEach(session => {
            const date = new Date(session.date).toISOString().split('T')[0];
            dateStats[date] = (dateStats[date] || 0) + session.duration;
        });

        return dateStats;
    }

    updateStats() {
        this.updateWeeklySummary();
        this.updateWeeklyChart();
        this.updateMonthlyHeatmap();
        this.updateTodayCards();
        this.updateDailyGoalBar();
    }

    getTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = this.sessions.filter(s => {
            return s.date.startsWith(today) && s.type === 'work';
        });
        const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        return { count: todaySessions.length, minutes: totalMinutes };
    }

    getStreak() {
        const dates = new Set(
            this.sessions
                .filter(s => s.type === 'work')
                .map(s => s.date.split('T')[0])
        );
        let streak = 0;
        const now = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            if (dates.has(dateStr)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    // ─── 레벨 시스템 ───────────────────────────────
    getLevelInfo() {
        const LEVELS = [
            { lv: 1, min: 0, titleKey: 'level.1', next: 10 },
            { lv: 2, min: 10, titleKey: 'level.2', next: 25 },
            { lv: 3, min: 25, titleKey: 'level.3', next: 50 },
            { lv: 4, min: 50, titleKey: 'level.4', next: 100 },
            { lv: 5, min: 100, titleKey: 'level.5', next: 200 },
            { lv: 6, min: 200, titleKey: 'level.6', next: null },
        ];
        const _t = (typeof window.t === 'function') ? window.t : (k) => k;
        const total = this.sessions.filter(s => s.type === 'work').length;
        let current = LEVELS[0];
        for (const lvl of LEVELS) {
            if (total >= lvl.min) current = lvl;
        }
        const prevMin = current.min;
        const nextMin = current.next;
        const xpPct = nextMin
            ? Math.min(((total - prevMin) / (nextMin - prevMin)) * 100, 100)
            : 100;
        return { lv: current.lv, titleKey: current.titleKey, title: _t(current.titleKey), xpPct, total, nextMin };
    }

    updateTodayCards() {
        const today = this.getTodayStats();
        const streak = this.getStreak();
        const lvInfo = this.getLevelInfo();

        // ─── Stats 화면 스트릭+레벨 배너 업데이트 ───
        this._updateStreakBanner(streak, today, lvInfo);
    }

    // ─── Share Card 데이터 ─────────────────────────────
    getShareData() {
        const today = this.getTodayStats();
        const streak = this.getStreak();
        const lvInfo = this.getLevelInfo();
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        const nickname = settings.nickname || localStorage.getItem('userName') || 'Bbangmodoro';
        return {
            nickname,
            minutesTotal: today.minutes,
            sessions: today.count,
            streak,
            level: lvInfo.lv,
            levelTitle: lvInfo.title,
        };
    }

    _updateStreakBanner(streak, today, lvInfo) {
        const oldLv = parseInt(localStorage.getItem('_streakBannerLv') || '1');

        // 스트릭 값
        const _t = (typeof window.t === 'function') ? window.t : (k, v) => k;
        const sVal = document.getElementById('slbStreakVal');
        if (sVal) {
            sVal.textContent = streak > 0 ? `🔥 ${streak}${_t('common.days') || '일'}` : '—';
            sVal.classList.toggle('hot', streak >= 7);
        }

        // 오늘 세션 값
        const tVal = document.getElementById('slbSessionVal');
        if (tVal) tVal.textContent = `${today.count}${_t('common.times') || '회'}`;

        // 레벨 값
        const lVal = document.getElementById('slbLevelVal');
        if (lVal) lVal.textContent = `Lv.${lvInfo.lv}`;

        // 레벨 칭호 (data-i18n 속성 업데이트 + textContent)
        const lTitle = document.getElementById('slbLevelTitle');
        if (lTitle) {
            if (lvInfo.titleKey) {
                lTitle.setAttribute('data-i18n', lvInfo.titleKey);
            }
            lTitle.textContent = lvInfo.title;
        }

        // XP 게이지
        const xpFill = document.getElementById('xpBarFill');
        if (xpFill) xpFill.style.width = lvInfo.xpPct + '%';

        const xpNext = document.getElementById('xpBarNext');
        if (xpNext) {
            xpNext.textContent = lvInfo.nextMin
                ? _t('streak.xpNext', { n: lvInfo.nextMin - lvInfo.total })
                : _t('streak.xpMax');
        }

        // 레벨업 감지
        if (lvInfo.lv > oldLv) {
            this._showLevelUpBurst(lvInfo);
        }
        localStorage.setItem('_streakBannerLv', String(lvInfo.lv));
    }

    _showLevelUpBurst(lvInfo) {
        const el = document.createElement('div');
        el.className = 'levelup-burst';
        el.innerHTML = `
            <div class="levelup-burst-emoji">${lvInfo.title.split(' ')[0]}</div>
            <div class="levelup-burst-text">LEVEL UP! Lv.${lvInfo.lv}</div>
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2400);
    }

    updateDailyGoalBar() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        const goalHours = parseFloat(settings.dailyGoal || 0);
        const goalBar = document.getElementById('dailyGoalBar');
        const goalFill = document.getElementById('goalFill');
        const goalProgress = document.getElementById('goalProgress');

        if (!goalBar) return;

        if (goalHours <= 0) {
            goalBar.style.display = 'none';
            return;
        }

        goalBar.style.display = 'block';
        const today = this.getTodayStats();
        const doneHours = today.minutes / 60;
        const pct = Math.min((doneHours / goalHours) * 100, 100);

        if (goalFill) {
            goalFill.style.width = pct + '%';
            goalFill.style.background = pct >= 100 ? '#4ecdc4' : 'var(--accent-work)';
        }
        if (goalProgress) {
            goalProgress.textContent = `${doneHours.toFixed(1)} / ${goalHours}h`;
        }

        // 목표 달성 축하 (처음 달성 시만)
        if (pct >= 100) {
            const goalKey = `goalCelebrated_${new Date().toISOString().split('T')[0]}`;
            if (!localStorage.getItem(goalKey)) {
                localStorage.setItem(goalKey, '1');
                this.showGoalCelebration();
            }
        }
    }

    showGoalCelebration() {
        const el = document.createElement('div');
        el.className = 'goal-celebration';
        el.innerHTML = '🎉 오늘 목표 달성!';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    }

    updateWeeklySummary() {
        const stats = this.getWeeklyStats();
        const weeklyTimeEl = document.getElementById('weeklyTime');
        if (weeklyTimeEl) {
            weeklyTimeEl.textContent = `${stats.total.hours} 시간 ${stats.total.minutes} 분`;
        }
    }

    updateWeeklyChart() {
        const stats = this.getWeeklyStats();
        const chartContainer = document.getElementById('weeklyChart');
        if (!chartContainer) return;

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = Object.values(stats.daily);
        const sumValues = values.reduce((a, b) => a + b, 0);

        if (sumValues === 0) {
            chartContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px;">
                    No activity this week
                </div>
            `;
            return;
        }

        // Set a minimum max value to avoid division by zero or tiny bars
        // But if max value is small, we still want it to scale up to be visible?
        // User wants "7.0 to go way up". 
        // If max is 7, then 7 should be 100%.
        const maxValue = Math.max(...values, 1);

        chartContainer.innerHTML = days.map(day => {
            const value = stats.daily[day];
            const hours = (value / 60).toFixed(1);
            // Calculate percentage based on max value in the set
            let heightPercent = (value / maxValue) * 100;

            // Ensure even small values have a tiny visible bar if they are not 0
            if (value > 0 && heightPercent < 5) heightPercent = 5;

            return `
                <div class="chart-bar">
                    <div class="bar-wrap">
                        <div class="bar" style="height: ${heightPercent}%"></div>
                    </div>
                    <span class="bar-value">${hours}</span>
                    <span class="bar-label">${day}</span>
                </div>
            `;
        }).join('');
    }

    updateMonthlyHeatmap() {
        const dateStats = this.getMonthlyStats();
        const heatmapContainer = document.getElementById('monthlyHeatmap');
        if (!heatmapContainer) return;

        const maxValue = Math.max(...Object.values(dateStats), 1);

        const days = [];
        const now = new Date();
        for (let i = 34; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const value = dateStats[dateStr] || 0;
            const level = this.getHeatmapLevel(value, maxValue);
            days.push({ date: dateStr, level, value });
        }

        const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        heatmapContainer.innerHTML = `
            <div class="heatmap-labels">
                ${dayLabels.map(label => `<div class="heatmap-label">${label}</div>`).join('')}
            </div>
            <div class="heatmap-grid">
                ${days.map(day => `
                    <div class="heatmap-day level-${day.level}" 
                         title="${day.date}: ${(day.value / 60).toFixed(1)} hours">
                    </div>
                `).join('')}
            </div>
        `;
    }

    getHeatmapLevel(value, maxValue) {
        if (value === 0) return 0;
        const ratio = value / maxValue;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        return 4;
    }
}

const statsManager = new StatsManager();

// ==============================================
// NAVIGATION LOGIC - CRITICAL FOR TAB SWITCHING
// ==============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    if (!navItems.length) {
        console.warn('Navigation items not found');
        return;
    }

    console.log('Initializing navigation with', navItems.length, 'items');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const targetViewId = item.dataset.view;
            console.log('Clicked nav item:', targetViewId);

            const targetView = document.getElementById(targetViewId);

            if (!targetView) {
                console.error(`View not found: ${targetViewId}`);
                return;
            }

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none';
            });

            targetView.style.display = 'block';
            setTimeout(() => {
                targetView.classList.add('active');
            }, 10);

            if (targetViewId === 'statsView' && window.statsManager) {
                window.statsManager.updateStats();
            }

            if (targetViewId === 'leaderboardView' && window.leaderboardManager) {
                // 로그인 배너 표시 여부
                const banner = document.getElementById('lbLoginBanner');
                if (banner) {
                    banner.style.display = window.auth?.currentUser ? 'none' : 'flex';
                }
                window.leaderboardManager.onEnterLeaderboard();
            }

            if (targetViewId === 'collectionView' && typeof window.renderCollectionView === 'function') {
                window.renderCollectionView();
            }

            console.log('Switched to view:', targetViewId);
        });
    });

    console.log('Navigation initialized successfully');
    initSwipe();
}

// Swipe Functionality
function initSwipe() {
    const app = document.getElementById('app');
    if (!app) return;

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    app.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    app.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const distance = touchEndX - touchStartX;
        if (Math.abs(distance) < minSwipeDistance) return;

        const navItems = Array.from(document.querySelectorAll('.nav-item'));
        const activeIndex = navItems.findIndex(item => item.classList.contains('active'));

        if (activeIndex === -1) return;

        let nextIndex = activeIndex;

        if (distance > 0) {
            if (activeIndex > 0) {
                nextIndex = activeIndex - 1;
            }
        } else {
            if (activeIndex < navItems.length - 1) {
                nextIndex = activeIndex + 1;
            }
        }

        if (nextIndex !== activeIndex) {
            navItems[nextIndex].click();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app && !app.classList.contains('app-hidden')) {
        console.log('App is visible, initializing navigation');
        initNavigation();
        statsManager.updateStats();
    }
});

// Initialize when startApp is called
const originalStartApp = window.startApp;
window.startApp = function () {
    if (originalStartApp) {
        originalStartApp();
    }
    setTimeout(() => {
        console.log('startApp called, initializing navigation');
        initNavigation();
        statsManager.updateStats();
    }, 600);
};

// Dummy data generator for testing
function generateDummyData() {
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const sessions = Math.floor(Math.random() * 10);
        for (let j = 0; j < sessions; j++) {
            statsManager.sessions.push({
                date: date.toISOString(),
                duration: 20,
                type: 'work'
            });
        }
    }
    statsManager.saveSessions();
    statsManager.updateStats();
}

window.generateDummyData = generateDummyData;
window.statsManager = statsManager;

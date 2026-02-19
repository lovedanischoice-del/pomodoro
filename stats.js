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
    }

    updateWeeklySummary() {
        const stats = this.getWeeklyStats();
        const weeklyTimeEl = document.getElementById('weeklyTime');
        if (weeklyTimeEl) {
            weeklyTimeEl.textContent = `${stats.total.hours} hrs ${stats.total.minutes} min`;
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

        const maxValue = Math.max(...values, 1);

        chartContainer.innerHTML = days.map(day => {
            const value = stats.daily[day];
            const hours = (value / 60).toFixed(1);
            const heightPercent = (value / maxValue) * 100;

            return `
                <div class="chart-bar">
                    <div class="bar" style="height: ${heightPercent}%">
                        <span class="bar-value">${hours}</span>
                    </div>
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

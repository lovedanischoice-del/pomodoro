// ============================================
// Schedule Start — 시작 예약 기능
// ============================================

(function () {
    'use strict';

    const SCHEDULE_DELAY_SEC = 15 * 60; // 15분
    const STORAGE_KEY = 'scheduleStartState';

    let scheduleTimerId = null;
    let scheduleSecondsLeft = 0;

    // ─── DOM 참조 ───
    function getOverlay() { return document.getElementById('scheduleOverlay'); }
    function getBadge() { return document.getElementById('scheduleBadge'); }
    function getBadgeTime() { return document.getElementById('scheduleBadgeTime'); }

    // ─── 오버레이 열기 / 닫기 ───
    function openScheduleOverlay() {
        const overlay = getOverlay();
        if (!overlay) return;
        overlay.classList.add('visible');
    }

    function closeScheduleOverlay() {
        const overlay = getOverlay();
        if (overlay) overlay.classList.remove('visible');
    }

    // ─── 지금 바로 시작 ───
    function startNow() {
        closeScheduleOverlay();
        cancelSchedule(false); // 혹시 대기 중이었다면 취소
        if (typeof toggleTimer === 'function' && !isRunning) {
            toggleTimer();
        }
    }

    // ─── 15분 뒤 시작 ───
    function startLater() {
        closeScheduleOverlay();
        if (scheduleTimerId) return; // 이미 예약 중

        scheduleSecondsLeft = SCHEDULE_DELAY_SEC;
        saveScheduleState();
        showBadge();
        tickSchedule();
    }

    function tickSchedule() {
        updateBadgeDisplay();
        scheduleTimerId = setTimeout(() => {
            scheduleSecondsLeft--;
            saveScheduleState();

            if (scheduleSecondsLeft <= 0) {
                clearSchedule();
                hideBadge();
                triggerCountdownAndStart();
            } else {
                tickSchedule();
            }
        }, 1000);
    }

    function clearSchedule() {
        if (scheduleTimerId) {
            clearTimeout(scheduleTimerId);
            scheduleTimerId = null;
        }
        scheduleSecondsLeft = 0;
        localStorage.removeItem(STORAGE_KEY);
    }

    function cancelSchedule(updateUI = true) {
        clearSchedule();
        if (updateUI) hideBadge();
    }

    // ─── localStorage 복원 ───
    function saveScheduleState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            endsAt: Date.now() + scheduleSecondsLeft * 1000
        }));
    }

    function restoreScheduleState() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const { endsAt } = JSON.parse(raw);
            const remaining = Math.floor((endsAt - Date.now()) / 1000);
            if (remaining > 0) {
                scheduleSecondsLeft = remaining;
                showBadge();
                tickSchedule();
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    // ─── 배지 표시 / 숨기기 ───
    function showBadge() {
        const badge = getBadge();
        if (badge) badge.classList.remove('hidden');
    }

    function hideBadge() {
        const badge = getBadge();
        if (badge) badge.classList.add('hidden');
    }

    function updateBadgeDisplay() {
        const el = getBadgeTime();
        if (!el) return;
        const m = Math.floor(scheduleSecondsLeft / 60);
        const s = scheduleSecondsLeft % 60;
        el.textContent = `${m}:${s.toString().padStart(2, '0')} 후 시작`;
    }

    // ─── 5-4-3-2-1 카운트다운 진입 ───
    function triggerCountdownAndStart() {
        // 알람음 재생
        if (typeof playChimeBell === 'function') playChimeBell();

        // 기존 rocket-countdown 사용 가능 시 활용
        if (typeof startRocketCountdown === 'function') {
            startRocketCountdown(() => {
                if (!isRunning && typeof toggleTimer === 'function') {
                    toggleTimer();
                }
            });
            return;
        }

        // fallback: 자체 5-4-3-2-1
        runSimpleCountdown(5, () => {
            if (!isRunning && typeof toggleTimer === 'function') {
                toggleTimer();
            }
        });
    }

    function runSimpleCountdown(from, onDone) {
        // 기존 overlay 재사용 or 간단 생성
        const overlay = document.createElement('div');
        overlay.className = 'schedule-countdown-overlay';
        document.body.appendChild(overlay);

        let n = from;

        function showNum() {
            overlay.innerHTML = `
                <div class="sco-number">${n}</div>
                <div class="sco-label">집중 시작까지</div>
            `;
            if (n <= 0) {
                setTimeout(() => {
                    overlay.remove();
                    onDone();
                }, 400);
                return;
            }
            n--;
            setTimeout(showNum, 900);
        }
        showNum();
    }

    // ─── DOM 주입 ───
    function injectDOM() {
        // 예약 버튼
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('scheduleBtn')) {
            const btn = document.createElement('button');
            btn.id = 'scheduleBtn';
            btn.className = 'btn-schedule';
            btn.innerHTML = '⏰ 시작 예약';
            btn.addEventListener('click', openScheduleOverlay);
            controls.appendChild(btn);
        }

        // 오버레이 (bottom sheet)
        if (!document.getElementById('scheduleOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'scheduleOverlay';
            overlay.className = 'schedule-overlay';
            overlay.innerHTML = `
                <div class="schedule-sheet">
                    <div class="schedule-sheet-handle"></div>
                    <h3>⏰ 시작 예약</h3>
                    <div class="schedule-btn-group">
                        <button class="schedule-choice-btn now-btn" id="schedNowBtn">
                            <span class="sch-btn-icon">🟢</span>
                            <span>
                                <span class="sch-btn-title">지금 바로 시작</span>
                                <span class="sch-btn-desc">타이머를 즉시 시작합니다</span>
                            </span>
                        </button>
                        <button class="schedule-choice-btn later-btn" id="schedLaterBtn">
                            <span class="sch-btn-icon">⏰</span>
                            <span>
                                <span class="sch-btn-title">15분 뒤에 시작</span>
                                <span class="sch-btn-desc">알람 후 5·4·3·2·1 카운트다운 진입</span>
                            </span>
                        </button>
                    </div>
                    <button class="schedule-cancel-btn" id="schedCancelBtn">취소</button>
                </div>
            `;
            // 배경 클릭 닫기
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeScheduleOverlay();
            });
            document.body.appendChild(overlay);

            document.getElementById('schedNowBtn')?.addEventListener('click', startNow);
            document.getElementById('schedLaterBtn')?.addEventListener('click', startLater);
            document.getElementById('schedCancelBtn')?.addEventListener('click', closeScheduleOverlay);
        }

        // 플로팅 배지
        if (!document.getElementById('scheduleBadge')) {
            const badge = document.createElement('div');
            badge.id = 'scheduleBadge';
            badge.className = 'schedule-badge hidden';
            badge.innerHTML = `
                <span>⏰</span>
                <span id="scheduleBadgeTime">15:00 후 시작</span>
                <span class="badge-cancel-x" id="scheduleBadgeCancel" title="예약 취소">✕</span>
            `;
            badge.addEventListener('click', (e) => {
                if (e.target.id === 'scheduleBadgeCancel' || e.target.closest('#scheduleBadgeCancel')) {
                    cancelSchedule(true);
                }
            });
            document.body.appendChild(badge);
        }
    }

    // ─── 초기화 ───
    function init() {
        injectDOM();
        restoreScheduleState();
    }

    // DOMContentLoaded or 즉시
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // app이 hidden 상태일 수 있으므로 약간 지연
        setTimeout(init, 300);
    }

    // window 전역 노출
    window.scheduleStart = { open: openScheduleOverlay, cancel: cancelSchedule };

})();

// ==============================================
// 5초 기능 3종 모음
// 1. 5-4-3-2-1 집중 로켓 (휴식 종료 전 카운트다운)
// 2. 5초 벌떡 스트레칭 (워크 세션 종료 후 미션)
// 3. 5초 마이크로 액션 (타이머 시작 전 한 가지 선언)
// ==============================================

// ─────────────────────────────────────────────
// 공통 유틸: Web Audio API 효과음 합성
// ─────────────────────────────────────────────
function playCountdownBeep() {
    // 차분한 싱잉볼 느낌: 낮고 일정한 음, 부드러운 페이드
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 432;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.65);
    } catch (e) { }
}

function playLaunchSound() {
    // 부드러운 2음 종소리 (집중 시작)
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [432, 576].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.22;
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            osc.start(t);
            osc.stop(t + 0.9);
        });
    } catch (e) { }
}

// ─────────────────────────────────────────────
// 기능 1: 5-4-3-2-1 집중 로켓
// ─────────────────────────────────────────────
let rocketTimerId = null;

function startRocketCountdown(onComplete) {
    const overlay = document.getElementById('rocketOverlay');
    const numEl = document.getElementById('rocketNumber');
    if (!overlay || !numEl) {
        if (onComplete) onComplete();
        return;
    }

    let count = 5;
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    numEl.textContent = count;
    numEl.className = 'rocket-number count-' + count;

    // 첫 beep
    playCountdownBeep();

    rocketTimerId = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.textContent = count;
            numEl.className = 'rocket-number count-' + count;
            playCountdownBeep();
        } else {
            // 발사!
            clearInterval(rocketTimerId);
            rocketTimerId = null;
            numEl.textContent = '🚀';
            numEl.className = 'rocket-number launch';
            playLaunchSound();

            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.classList.add('hidden');
                if (onComplete) onComplete();
            }, 700);
        }
    }, 1000);
}

window.startRocketCountdown = startRocketCountdown;

// ─────────────────────────────────────────────
// 기능 2: 5초 벌떡 스트레칭
// ─────────────────────────────────────────────
let stretchTimerId = null;
let motionListener = null;

function startStretchMission(onComplete) {
    const _s = JSON.parse(localStorage.getItem('settings') || '{}');
    if (_s.stretchMission === false) { if (onComplete) onComplete(); return; }

    const overlay = document.getElementById('stretchOverlay');
    const countdownEl = document.getElementById('stretchCountdown');
    const doneBtn = document.getElementById('stretchDoneBtn');
    if (!overlay) {
        if (onComplete) onComplete();
        return;
    }

    let count = 5;
    window.modalManager?.openModal('stretchOverlay');
    if (countdownEl) countdownEl.textContent = count;

    // 완료 처리
    function completeMission() {
        clearInterval(stretchTimerId);
        stretchTimerId = null;
        removeMotionListener();
        overlay.classList.add('done-flash');
        setTimeout(() => {
            window.modalManager?.closeModal('stretchOverlay');
            overlay.classList.remove('done-flash');
            if (onComplete) onComplete();
        }, 600);
    }

    // 가속도 센서 감지 (모바일 HTTPS)
    function removeMotionListener() {
        if (motionListener) {
            window.removeEventListener('devicemotion', motionListener);
            motionListener = null;
        }
    }

    if (window.DeviceMotionEvent) {
        motionListener = (e) => {
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            if (magnitude > 20) { // 일어나는 움직임 임계값
                completeMission();
            }
        };
        window.addEventListener('devicemotion', motionListener);
    }

    // 버튼 클릭
    if (doneBtn) {
        doneBtn.onclick = () => completeMission();
    }

    // 5초 타임아웃 fallback
    stretchTimerId = setInterval(() => {
        count--;
        if (countdownEl) countdownEl.textContent = count;
        if (count <= 0) {
            completeMission();
        }
    }, 1000);
}

window.startStretchMission = startStretchMission;

// ─────────────────────────────────────────────
// 기능 3: 5초 마이크로 액션
// ─────────────────────────────────────────────
let microTimerId = null;
let microTimerBarAnim = null;

function showMicroActionPopup(onStart) {
    const _s = JSON.parse(localStorage.getItem('settings') || '{}');
    if (_s.microAction === false) { if (onStart) onStart(''); return; }

    const overlay = document.getElementById('microActionOverlay');
    const input = document.getElementById('microActionInput');
    const startBtn = document.getElementById('microStartBtn');
    const timerFill = document.getElementById('microTimerFill');
    const badge = document.getElementById('microActionBadge');

    if (!overlay) {
        if (onStart) onStart('');
        return;
    }

    let countdown = 5;
    window.modalManager?.openModal('microActionOverlay');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }

    // 타이머 바 애니메이션
    if (timerFill) {
        timerFill.style.transition = 'none';
        timerFill.style.width = '100%';
        setTimeout(() => {
            timerFill.style.transition = `width ${countdown}s linear`;
            timerFill.style.width = '0%';
        }, 50);
    }

    function finishPopup() {
        clearInterval(microTimerId);
        microTimerId = null;
        window.modalManager?.closeModal('microActionOverlay');

        const actionText = input ? input.value.trim() : '';

        // localStorage에 로그 저장
        if (actionText) {
            const logs = JSON.parse(localStorage.getItem('microActions') || '[]');
            logs.unshift({ text: actionText, time: new Date().toISOString() });
            if (logs.length > 50) logs.pop();
            localStorage.setItem('microActions', JSON.stringify(logs));
        }

        // 타이머 상단 배지 업데이트
        updateMicroActionBadge(actionText);

        if (onStart) onStart(actionText);
    }

    // 버튼 클릭
    if (startBtn) startBtn.onclick = () => finishPopup();

    // Enter 키
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') finishPopup();
        };
    }

    // 5초 타임아웃
    microTimerId = setInterval(() => {
        countdown--;
        if (countdown <= 0) finishPopup();
    }, 1000);
}

function updateMicroActionBadge(text) {
    const badge = document.getElementById('microActionBadge');
    if (!badge) return;
    if (text) {
        badge.textContent = '🎯 ' + text;
        badge.classList.remove('hidden');
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
        badge.classList.add('hidden');
    }
}

window.showMicroActionPopup = showMicroActionPopup;
window.updateMicroActionBadge = updateMicroActionBadge;

// ─────────────────────────────────────────────
// 기능 4: 1분 맛보기 타이머 (벌떡 콤보)
// 벌떡 스트레칭 완료 후 딱 1분 미니 세션 제안
// ─────────────────────────────────────────────
let tasteTimerId = null;

function show1MinTaste(onDone) {
    const _s = JSON.parse(localStorage.getItem('settings') || '{}');
    if (_s.oneMinTaste === false) { if (onDone) onDone(); return; }

    const overlay = document.getElementById('oneMinTasteOverlay');
    if (!overlay) {
        if (onDone) onDone();
        return;
    }

    const countEl = document.getElementById('oneMinCountdown');
    const ringEl = document.getElementById('oneMinRingFill');
    const startBtn = document.getElementById('oneMinStartBtn');
    const skipBtn = document.getElementById('oneMinSkipBtn');

    const TOTAL = 60;
    let remaining = TOTAL;
    const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    if (countEl) countEl.textContent = '1:00';

    // SVG 링 초기화
    if (ringEl) {
        ringEl.style.strokeDasharray = CIRCUMFERENCE;
        ringEl.style.strokeDashoffset = 0;
    }

    function updateRing() {
        if (!ringEl) return;
        const offset = CIRCUMFERENCE * (1 - remaining / TOTAL);
        ringEl.style.strokeDashoffset = offset;
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function dismiss(startWork) {
        clearInterval(tasteTimerId);
        tasteTimerId = null;
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
        if (startWork) {
            // 1분 실제 집중으로 연결: 타이머를 1분으로 설정 후 시작
            if (typeof timeLeft !== 'undefined') {
                window._oneMinOverride = true;
            }
        }
        if (onDone) onDone(startWork);
    }

    if (startBtn) startBtn.onclick = () => dismiss(true);
    if (skipBtn) skipBtn.onclick = () => dismiss(false);

    tasteTimerId = setInterval(() => {
        remaining--;
        if (countEl) countEl.textContent = formatTime(remaining);
        updateRing();
        if (remaining <= 0) dismiss(false);
    }, 1000);
}

window.show1MinTaste = show1MinTaste;

// ==============================================
// 5초 기능 3종 모음
// 1. 5-4-3-2-1 집중 로켓 (휴식 종료 전 카운트다운)
// 2. 5초 벌떡 스트레칭 (워크 세션 종료 후 미션)
// 3. 5초 마이크로 액션 (타이머 시작 전 한 가지 선언)
// ==============================================

// ─────────────────────────────────────────────
// 공통 유틸: Web Audio API 효과음 합성
// ─────────────────────────────────────────────
function playCountdownBeep(frequency = 440, duration = 0.15) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // 오디오 컨텍스트 없을 때 무시
    }
}

function playLaunchSound() {
    // 로켓 발사 느낌: 주파수 스윕 업
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
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
    playCountdownBeep(300 + count * 80, 0.18);

    rocketTimerId = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.textContent = count;
            numEl.className = 'rocket-number count-' + count;
            // 카운트가 낮을수록 높은 주파수 (긴장감)
            playCountdownBeep(300 + count * 80, 0.18);
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
    const overlay = document.getElementById('stretchOverlay');
    const countdownEl = document.getElementById('stretchCountdown');
    const doneBtn = document.getElementById('stretchDoneBtn');
    if (!overlay) {
        if (onComplete) onComplete();
        return;
    }

    let count = 5;
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    if (countdownEl) countdownEl.textContent = count;

    // 완료 처리
    function completeMission() {
        clearInterval(stretchTimerId);
        stretchTimerId = null;
        removeMotionListener();
        overlay.classList.add('done-flash');
        setTimeout(() => {
            overlay.classList.remove('active', 'done-flash');
            overlay.classList.add('hidden');
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
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
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
        overlay.classList.remove('active');
        overlay.classList.add('hidden');

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

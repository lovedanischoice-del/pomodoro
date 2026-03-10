// ==============================================
// 🌊 플로우 가드 (Flow Guard)
// 세션 종료 시 딥워크 상태 감지 → 10분 연장 제안
// ==============================================

let lastActivityTime = Date.now();
let flowGuardCallback = null;

// 마우스/키보드 활동 감지
function _recordActivity() {
    lastActivityTime = Date.now();
}

document.addEventListener('mousemove', _recordActivity, { passive: true });
document.addEventListener('keydown', _recordActivity, { passive: true });
document.addEventListener('click', _recordActivity, { passive: true });

/**
 * 세션 종료 시 호출: 딥워크 상태면 "10분 더?" 팝업 표시
 * @param {Function} onExtend  - 연장 선택 시 콜백 (extendSeconds: number)
 * @param {Function} onDecline - 거절/스킵 시 콜백
 */
function checkFlowState(onExtend, onDecline) {
    const idleMs = Date.now() - lastActivityTime;
    const IDLE_THRESHOLD_MS = 30_000; // 30초 이내 활동 = 딥워크 중

    if (idleMs < IDLE_THRESHOLD_MS) {
        showFlowGuardPrompt(onExtend, onDecline);
    } else {
        // 이미 멍때리고 있음, 바로 전환
        if (onDecline) onDecline();
    }
}

let flowCountdownId = null;

function showFlowGuardPrompt(onExtend, onDecline) {
    const overlay = document.getElementById('flowGuardOverlay');
    if (!overlay) {
        if (onDecline) onDecline();
        return;
    }

    const yesBtn = document.getElementById('flowYesBtn');
    const noBtn = document.getElementById('flowNoBtn');
    const countdownEl = document.getElementById('flowGuardCountdown');
    const progressFill = document.getElementById('flowGuardProgressFill');

    let seconds = 7; // 7초 자동 전환

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    if (countdownEl) countdownEl.textContent = seconds;

    // 프로그레스 바 애니메이션
    if (progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.width = '100%';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressFill.style.transition = `width ${seconds}s linear`;
                progressFill.style.width = '0%';
            });
        });
    }

    function dismiss(isExtend) {
        clearInterval(flowCountdownId);
        flowCountdownId = null;
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
        if (isExtend) {
            onExtend && onExtend(10 * 60); // 10분 연장
        } else {
            onDecline && onDecline();
        }
    }

    if (yesBtn) yesBtn.onclick = () => dismiss(true);
    if (noBtn) noBtn.onclick = () => dismiss(false);

    // 7초 자동 거절
    flowCountdownId = setInterval(() => {
        seconds--;
        if (countdownEl) countdownEl.textContent = seconds;
        if (seconds <= 0) dismiss(false);
    }, 1000);
}

window.checkFlowState = checkFlowState;

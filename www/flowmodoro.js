// ==============================================
// ⏱️ 플로우모도로 (Flowmodoro)
// 25분 종료 후 업카운트 → 사용자가 멈출 때 Total/5 = 휴식
// ==============================================

let flowmodoroEnabled = false;
let flowElapsed = 0;       // 업카운트 초
let flowTimerId = null;
let flowActive = false;
let flowOnStop = null;     // 완료 시 콜백

/**
 * 설정 저장값에서 플로우모도로 활성 여부 로드
 */
function isFlowmodoroEnabled() {
    const s = JSON.parse(localStorage.getItem('settings') || '{}');
    return s.flowmodoroEnabled === true;
}

/**
 * 워크 세션 종료 시 main.js 에서 호출
 * @param {number} alreadyWorkedSec - 이미 집중한 초(포모도로 세션 길이)
 * @param {Function} onStop - 사용자가 "지금 멈추기"를 누를 때 호출. (breakSec) 인자 포함
 */
function startFlowmodoro(alreadyWorkedSec, onStop) {
    if (!isFlowmodoroEnabled()) {
        if (onStop) onStop(0); // 플로우모도로 비활성: 바로 콜백
        return;
    }

    flowElapsed = alreadyWorkedSec || 0;
    flowActive = true;
    flowOnStop = onStop;

    // 업카운트 UI 표시
    showFlowmodoroBar(true);
    updateFlowmodoroDisplay();

    // Document Visibility: 백그라운드 진입 시 멈춤
    document.addEventListener('visibilitychange', _onVisibilityChange);

    flowTimerId = setInterval(() => {
        if (!document.hidden) {
            flowElapsed++;
            updateFlowmodoroDisplay();
        }
    }, 1000);
}

function _onVisibilityChange() {
    // 백그라운드 복귀 시 배지로 알림 (타이머는 계속)
    if (!document.hidden) {
        const bar = document.getElementById('flowmodoroBar');
        if (bar) bar.classList.add('flow-resumed');
        setTimeout(() => bar?.classList.remove('flow-resumed'), 1500);
    }
}

/**
 * 사용자가 "지금 멈추기" 버튼 클릭 시
 */
function stopFlowmodoro() {
    if (!flowActive) return;

    clearInterval(flowTimerId);
    flowTimerId = null;
    flowActive = false;
    document.removeEventListener('visibilitychange', _onVisibilityChange);

    const breakSec = Math.round(flowElapsed / 5);

    // 결과 표시
    showFlowResult(flowElapsed, breakSec);

    showFlowmodoroBar(false);
}

function showFlowmodoroBar(visible) {
    const bar = document.getElementById('flowmodoroBar');
    if (!bar) return;
    if (visible) {
        bar.classList.remove('hidden');
        bar.classList.add('active');
    } else {
        bar.classList.remove('active');
        bar.classList.add('hidden');
    }
}

function updateFlowmodoroDisplay() {
    const el = document.getElementById('flowmodoroTime');
    if (!el) return;
    const m = Math.floor(flowElapsed / 60);
    const s = flowElapsed % 60;
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * 결과 오버레이 표시
 */
function showFlowResult(totalSec, breakSec) {
    const overlay = document.getElementById('flowResultOverlay');
    if (!overlay) {
        // 오버레이 없으면 그냥 콜백
        if (flowOnStop) flowOnStop(breakSec);
        return;
    }

    const totalMin = (totalSec / 60).toFixed(1);
    const breakMin = Math.max(1, Math.round(breakSec / 60));

    const totalEl = document.getElementById('flowResultTotal');
    const breakEl = document.getElementById('flowResultBreak');
    if (totalEl) totalEl.textContent = totalMin + '분';
    if (breakEl) breakEl.textContent = breakMin + '분';

    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    const confirmBtn = document.getElementById('flowResultConfirmBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            if (flowOnStop) flowOnStop(breakSec);
        };
    }
}

// 설정 토글 반영
window.setFlowmodoroEnabled = function (val) {
    const s = JSON.parse(localStorage.getItem('settings') || '{}');
    s.flowmodoroEnabled = val;
    localStorage.setItem('settings', JSON.stringify(s));

    // UI 버튼 업데이트
    const btn = document.getElementById('flowmodoroToggleBtn');
    if (btn) {
        btn.textContent = val ? '⏱️ Flowmodoro ON' : '⏱️ Flowmodoro OFF';
        btn.classList.toggle('active', val);
    }
};

window.startFlowmodoro = startFlowmodoro;
window.stopFlowmodoro = stopFlowmodoro;
window.isFlowmodoroEnabled = isFlowmodoroEnabled;

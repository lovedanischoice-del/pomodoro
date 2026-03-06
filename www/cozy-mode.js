// ==============================================
// 🌿 세로토닌 코지(Cozy) 모드
// 딥 그린 테마 + 비 소리 / 장작 소리 믹서
// ==============================================

const COZY_STORAGE_KEY = 'cozyMode';
let cozyEnabled = false;

// Audio Context & Nodes
let cozyAudioCtx = null;

// Rain
let rainAudioBuffer = null;
let rainSourceNode = null;
let rainGainNode = null;
let isRainPlaying = false;

// Fire
let fireAudioBuffer = null;
let fireSourceNode = null;
let fireGainNode = null;
let isFirePlaying = false;

/**
 * 코지 모드 초기화
 */
function initCozyMode() {
    // 저장된 상태 복원
    cozyEnabled = localStorage.getItem(COZY_STORAGE_KEY) === 'true';

    const toggleBtn = document.getElementById('cozyToggleBtn');
    const panel = document.getElementById('cozyMixerPanel');
    const rainSlider = document.getElementById('cozyRainSlider');
    const fireSlider = document.getElementById('cozyFireSlider');
    const closeBtn = document.getElementById('cozyPanelClose');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            openCozyPanel(panel);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeCozyPanel(panel);
        });
    }

    if (rainSlider) {
        rainSlider.addEventListener('input', (e) => {
            setRainVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyRainValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    if (fireSlider) {
        fireSlider.addEventListener('input', (e) => {
            setFireVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyFireValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    const playRainBtn = document.getElementById('playRainBtn');
    const playFireBtn = document.getElementById('playFireBtn');

    if (playRainBtn) {
        playRainBtn.addEventListener('click', toggleRain);
    }
    if (playFireBtn) {
        playFireBtn.addEventListener('click', toggleFire);
    }

    // 코지 모드 토글 스위치
    const cozySwitch = document.getElementById('cozyModeSwitch');
    if (cozySwitch) {
        cozySwitch.checked = cozyEnabled;
        cozySwitch.addEventListener('change', (e) => {
            toggleCozyMode(e.target.checked);
        });
    }

    // 복원
    if (cozyEnabled) {
        applyCozyTheme(true);
        updateCozyToggleBtn(true);
    }
}

function openCozyPanel(panel) {
    if (window.modalManager) {
        window.modalManager.openModal('cozyMixerPanel');
    }
}

function closeCozyPanel(panel) {
    if (window.modalManager) {
        window.modalManager.closeModal('cozyMixerPanel');
    }
}

/**
 * 코지 모드 ON/OFF 전환
 */
function toggleCozyMode(forceState) {
    cozyEnabled = forceState !== undefined ? forceState : !cozyEnabled;
    localStorage.setItem(COZY_STORAGE_KEY, cozyEnabled);

    applyCozyTheme(cozyEnabled);
    updateCozyToggleBtn(cozyEnabled);

    if (!cozyEnabled) {
        stopCozyAudio();
    }
}

function applyCozyTheme(on) {
    document.body.classList.toggle('cozy-mode', on);
}

function updateCozyToggleBtn(on) {
    const btn = document.getElementById('cozyToggleBtn');
    if (btn) {
        btn.classList.toggle('active', on);
        btn.title = on ? '코지 모드 켜짐 🌿' : '코지 모드';
    }
}

// ─────────────────────────────────────────────
// Web Audio API 사운드 믹서
// ─────────────────────────────────────────────

function getAudioCtx() {
    if (!cozyAudioCtx) {
        cozyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return cozyAudioCtx;
}

async function toggleRain() {
    const btn = document.getElementById('playRainBtn');
    if (isRainPlaying) {
        stopRain();
        if (btn) btn.textContent = '▶';
    } else {
        await startRain();
        if (btn) btn.textContent = '⏸';
    }
}

async function toggleFire() {
    const btn = document.getElementById('playFireBtn');
    if (isFirePlaying) {
        stopFire();
        if (btn) btn.textContent = '▶';
    } else {
        await startFire();
        if (btn) btn.textContent = '⏸';
    }
}

async function startRain() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        if (!rainAudioBuffer) {
            const resp = await fetch('sounds/bgm/Fentlerain.mp3');
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                rainAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
            }
        }

        if (rainAudioBuffer && !rainSourceNode) {
            rainSourceNode = ctx.createBufferSource();
            rainSourceNode.buffer = rainAudioBuffer;
            rainSourceNode.loop = true;

            rainGainNode = ctx.createGain();
            const savedRain = parseFloat(localStorage.getItem('cozyRainVol') || '0.3');
            rainGainNode.gain.value = savedRain;

            rainSourceNode.connect(rainGainNode);
            rainGainNode.connect(ctx.destination);
            rainSourceNode.start(0);
            isRainPlaying = true;

            const rainSlider = document.getElementById('cozyRainSlider');
            if (rainSlider) rainSlider.value = savedRain;
            const label = document.getElementById('cozyRainValue');
            if (label) label.textContent = Math.round(savedRain * 100) + '%';
        }
    } catch (err) {
        console.warn('[CozyMode] 빗소리 시작 실패:', err);
    }
}

function stopRain() {
    try {
        if (rainSourceNode) {
            rainSourceNode.stop();
            rainSourceNode.disconnect();
            rainSourceNode = null;
        }
        if (rainGainNode) {
            rainGainNode.disconnect();
            rainGainNode = null;
        }
        isRainPlaying = false;
    } catch (e) { }
}

async function startFire() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        if (!fireAudioBuffer) {
            const resp = await fetch('sounds/bgm/Crackle_Campfire.mp3');
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                fireAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
            }
        }

        if (fireAudioBuffer && !fireSourceNode) {
            fireSourceNode = ctx.createBufferSource();
            fireSourceNode.buffer = fireAudioBuffer;
            fireSourceNode.loop = true;

            fireGainNode = ctx.createGain();
            const savedFire = parseFloat(localStorage.getItem('cozyFireVol') || '0.5');
            fireGainNode.gain.value = savedFire;

            fireSourceNode.connect(fireGainNode);
            fireGainNode.connect(ctx.destination);
            fireSourceNode.start(0);
            isFirePlaying = true;

            const fireSlider = document.getElementById('cozyFireSlider');
            if (fireSlider) fireSlider.value = savedFire;
            const label = document.getElementById('cozyFireValue');
            if (label) label.textContent = Math.round(savedFire * 100) + '%';
        }
    } catch (err) {
        console.warn('[CozyMode] 장작소리 시작 실패:', err);
    }
}

function stopFire() {
    try {
        if (fireSourceNode) {
            fireSourceNode.stop();
            fireSourceNode.disconnect();
            fireSourceNode = null;
        }
        if (fireGainNode) {
            fireGainNode.disconnect();
            fireGainNode = null;
        }
        isFirePlaying = false;
    } catch (e) { }
}

function stopCozyAudio() {
    stopRain();
    stopFire();
    const btnRain = document.getElementById('playRainBtn');
    if (btnRain) btnRain.textContent = '▶';
    const btnFire = document.getElementById('playFireBtn');
    if (btnFire) btnFire.textContent = '▶';
}

function setRainVolume(value) {
    if (rainGainNode) {
        rainGainNode.gain.value = value;
    }
    localStorage.setItem('cozyRainVol', value);
}

function setFireVolume(value) {
    if (fireGainNode) {
        fireGainNode.gain.value = value;
    }
    localStorage.setItem('cozyFireVol', value);
}

window.initCozyMode = initCozyMode;
window.toggleCozyMode = toggleCozyMode;
window.openCozyPanel = openCozyPanel;

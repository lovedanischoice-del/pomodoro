// ==============================================
// 🌿 세로토닌 코지(Cozy) 모드
// 딥 그린 테마 + 비 소리 / 장작 소리 믹서
// ==============================================

const COZY_STORAGE_KEY = 'cozyMode';
let cozyEnabled = false;

// Audio Context & Nodes
let cozyAudioCtx = null;
let rainAudioBuffer = null;
let rainSourceNode = null;
let rainGainNode = null;
let fireGainNodeCozy = null; // 기존 fireSound 와 별개로 코지 전용 gain 제어

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
    if (!panel) panel = document.getElementById('cozyMixerPanel');
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.classList.add('active');
}

function closeCozyPanel(panel) {
    if (!panel) panel = document.getElementById('cozyMixerPanel');
    if (!panel) return;
    panel.classList.remove('active');
    setTimeout(() => panel.classList.add('hidden'), 300);
}

/**
 * 코지 모드 ON/OFF 전환
 */
function toggleCozyMode(forceState) {
    cozyEnabled = forceState !== undefined ? forceState : !cozyEnabled;
    localStorage.setItem(COZY_STORAGE_KEY, cozyEnabled);

    applyCozyTheme(cozyEnabled);
    updateCozyToggleBtn(cozyEnabled);

    if (cozyEnabled) {
        startCozyAudio();
    } else {
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

async function startCozyAudio() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        // 비 소리 (Web Audio)
        if (!rainAudioBuffer) {
            const resp = await fetch('sounds/bgm/rain.mp3');
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

            // 슬라이더 초기값 반영
            const rainSlider = document.getElementById('cozyRainSlider');
            if (rainSlider) {
                rainSlider.value = savedRain;
                const label = document.getElementById('cozyRainValue');
                if (label) label.textContent = Math.round(savedRain * 100) + '%';
            }
        }

        // 기존 fireSound 볼륨 연동
        const savedFire = parseFloat(localStorage.getItem('cozyFireVol') || '0.5');
        const fireSlider = document.getElementById('cozyFireSlider');
        if (fireSlider) {
            fireSlider.value = savedFire;
            const label = document.getElementById('cozyFireValue');
            if (label) label.textContent = Math.round(savedFire * 100) + '%';
        }
        setFireVolume(savedFire);

    } catch (err) {
        console.warn('[CozyMode] 오디오 시작 실패:', err);
    }
}

function stopCozyAudio() {
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
    } catch (e) { }
}

function setRainVolume(value) {
    if (rainGainNode) {
        rainGainNode.gain.value = value;
    }
    localStorage.setItem('cozyRainVol', value);
}

function setFireVolume(value) {
    // 기존 fireSound 엘리먼트 볼륨 조정
    const fireSound = document.getElementById('fireSound');
    if (fireSound) fireSound.volume = value;
    localStorage.setItem('cozyFireVol', value);
}

window.initCozyMode = initCozyMode;
window.toggleCozyMode = toggleCozyMode;
window.openCozyPanel = openCozyPanel;

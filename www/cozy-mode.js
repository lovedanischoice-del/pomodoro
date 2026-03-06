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

// Fire (장작)
let fireAudioBuffer = null;
let fireSourceNode = null;
let fireGainNode = null;
let isFirePlaying = false;

// Fireplace (벽난로)
let fireplaceAudioBuffer = null;
let fireplaceSourceNode = null;
let fireplaceGainNode = null;
let isFireplacePlaying = false;

// Library (도서관)
let libraryAudioBuffer = null;
let librarySourceNode = null;
let libraryGainNode = null;
let isLibraryPlaying = false;

/**
 * 코지 모드 초기화
 */
function getCozyPanelHTML() {
    const savedRain = parseFloat(localStorage.getItem('cozyRainVol') || '0.3');
    const savedFire = parseFloat(localStorage.getItem('cozyFireVol') || '0.5');
    const rainPct = Math.round(savedRain * 100);
    const firePct = Math.round(savedFire * 100);
    const rainBtn = isRainPlaying ? '⏸' : '▶';
    const fireBtn = isFirePlaying ? '⏸' : '▶';

    const savedFireplace = parseFloat(localStorage.getItem('cozyFireplaceVol') || '0.4');
    const savedLibrary = parseFloat(localStorage.getItem('cozyLibraryVol') || '0.3');
    const fireplacePct = Math.round(savedFireplace * 100);
    const libraryPct = Math.round(savedLibrary * 100);
    const fireplaceBtn = isFireplacePlaying ? '⏸' : '▶';
    const libraryBtn = isLibraryPlaying ? '⏸' : '▶';

    return `
        <div class="bbang-modal-header">
            <h3 class="bbang-modal-title">🌿 세로토닌 코지 모드</h3>
            <button class="bbang-modal-close" id="cozyPanelClose">✕</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <span style="color:var(--text-secondary); font-size:14px;">코지 모드</span>
            <label class="toggle">
                <input type="checkbox" id="cozyModeSwitch" ${cozyEnabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div class="cozy-mixer-body">
            <div class="mixer-track">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="margin:0; color:var(--text-primary);">🌧️ 빗소리</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span id="cozyRainValue" style="font-size:0.9em; color:var(--text-secondary);">${rainPct}%</span>
                        <button id="playRainBtn" style="background:transparent; border:none; color:var(--text-primary); font-size:16px; cursor:pointer; padding:0;">${rainBtn}</button>
                    </div>
                </div>
                <input type="range" id="cozyRainSlider" min="0" max="1" step="0.05" value="${savedRain}">
            </div>
            <div class="mixer-track">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="margin:0; color:var(--text-primary);">🔥 장작소리</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span id="cozyFireValue" style="font-size:0.9em; color:var(--text-secondary);">${firePct}%</span>
                        <button id="playFireBtn" style="background:transparent; border:none; color:var(--text-primary); font-size:16px; cursor:pointer; padding:0;">${fireBtn}</button>
                    </div>
                </div>
                <input type="range" id="cozyFireSlider" min="0" max="1" step="0.05" value="${savedFire}">
            </div>
            <div class="mixer-track">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="margin:0; color:var(--text-primary);">🏠 벽난로</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span id="cozyFireplaceValue" style="font-size:0.9em; color:var(--text-secondary);">${fireplacePct}%</span>
                        <button id="playFireplaceBtn" style="background:transparent; border:none; color:var(--text-primary); font-size:16px; cursor:pointer; padding:0;">${fireplaceBtn}</button>
                    </div>
                </div>
                <input type="range" id="cozyFireplaceSlider" min="0" max="1" step="0.05" value="${savedFireplace}">
            </div>
            <div class="mixer-track">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <label style="margin:0; color:var(--text-primary);">📚 도서관</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span id="cozyLibraryValue" style="font-size:0.9em; color:var(--text-secondary);">${libraryPct}%</span>
                        <button id="playLibraryBtn" style="background:transparent; border:none; color:var(--text-primary); font-size:16px; cursor:pointer; padding:0;">${libraryBtn}</button>
                    </div>
                </div>
                <input type="range" id="cozyLibrarySlider" min="0" max="1" step="0.05" value="${savedLibrary}">
            </div>
        </div>
    `;
}

function bindCozyControls() {
    const closeBtn = document.getElementById('cozyPanelClose');
    if (closeBtn) closeBtn.addEventListener('click', () => BbangModal.hide());

    const cozySwitch = document.getElementById('cozyModeSwitch');
    if (cozySwitch) {
        cozySwitch.addEventListener('change', (e) => toggleCozyMode(e.target.checked));
    }

    const rainSlider = document.getElementById('cozyRainSlider');
    if (rainSlider) {
        rainSlider.addEventListener('input', (e) => {
            setRainVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyRainValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    const fireSlider = document.getElementById('cozyFireSlider');
    if (fireSlider) {
        fireSlider.addEventListener('input', (e) => {
            setFireVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyFireValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    const playRainBtn = document.getElementById('playRainBtn');
    if (playRainBtn) playRainBtn.addEventListener('click', toggleRain);

    const playFireBtn = document.getElementById('playFireBtn');
    if (playFireBtn) playFireBtn.addEventListener('click', toggleFire);

    const fireplaceSlider = document.getElementById('cozyFireplaceSlider');
    if (fireplaceSlider) {
        fireplaceSlider.addEventListener('input', (e) => {
            setFireplaceVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyFireplaceValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    const librarySlider = document.getElementById('cozyLibrarySlider');
    if (librarySlider) {
        librarySlider.addEventListener('input', (e) => {
            setLibraryVolume(parseFloat(e.target.value));
            const label = document.getElementById('cozyLibraryValue');
            if (label) label.textContent = Math.round(e.target.value * 100) + '%';
        });
    }

    const playFireplaceBtn = document.getElementById('playFireplaceBtn');
    if (playFireplaceBtn) playFireplaceBtn.addEventListener('click', toggleFireplace);

    const playLibraryBtn = document.getElementById('playLibraryBtn');
    if (playLibraryBtn) playLibraryBtn.addEventListener('click', toggleLibrary);
}

function initCozyMode() {
    // 저장된 상태 복원
    cozyEnabled = localStorage.getItem(COZY_STORAGE_KEY) === 'true';
    window.cozyEnabled = cozyEnabled;

    const toggleBtn = document.getElementById('cozyToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => openCozyPanel());
    }

    // 복원
    if (cozyEnabled) {
        applyCozyTheme(true);
        updateCozyToggleBtn(true);
    }
}

function openCozyPanel() {
    BbangModal.show({
        position: 'center',
        content: getCozyPanelHTML(),
        onReady: bindCozyControls,
    });
}

function closeCozyPanel() {
    BbangModal.hide();
}

/**
 * 코지 모드 ON/OFF 전환
 */
function toggleCozyMode(forceState) {
    cozyEnabled = forceState !== undefined ? forceState : !cozyEnabled;
    window.cozyEnabled = cozyEnabled;
    localStorage.setItem(COZY_STORAGE_KEY, cozyEnabled);

    applyCozyTheme(cozyEnabled);
    updateCozyToggleBtn(cozyEnabled);

    if (!cozyEnabled) {
        stopCozyAudio();
        // 코지 모드 OFF 시 기존 BGM 복원
        if (typeof handleSound === 'function') handleSound();
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
        window.CozyParticles?.deactivate('rain');
    } else {
        await startRain();
        if (btn) btn.textContent = '⏸';
        window.CozyParticles?.activate('rain');
    }
}

async function toggleFire() {
    const btn = document.getElementById('playFireBtn');
    if (isFirePlaying) {
        stopFire();
        if (btn) btn.textContent = '▶';
        window.CozyParticles?.deactivate('fire');
    } else {
        await startFire();
        if (btn) btn.textContent = '⏸';
        window.CozyParticles?.activate('fire');
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

async function toggleFireplace() {
    const btn = document.getElementById('playFireplaceBtn');
    if (isFireplacePlaying) {
        stopFireplace();
        if (btn) btn.textContent = '▶';
        window.CozyParticles?.deactivate('fireplace');
    } else {
        await startFireplace();
        if (btn) btn.textContent = '⏸';
        window.CozyParticles?.activate('fireplace');
    }
}

async function startFireplace() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        if (!fireplaceAudioBuffer) {
            const resp = await fetch('sounds/bgm/Fireplace-loop.mp3');
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                fireplaceAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
            }
        }

        if (fireplaceAudioBuffer && !fireplaceSourceNode) {
            fireplaceSourceNode = ctx.createBufferSource();
            fireplaceSourceNode.buffer = fireplaceAudioBuffer;
            fireplaceSourceNode.loop = true;

            fireplaceGainNode = ctx.createGain();
            const savedVol = parseFloat(localStorage.getItem('cozyFireplaceVol') || '0.4');
            fireplaceGainNode.gain.value = savedVol;

            fireplaceSourceNode.connect(fireplaceGainNode);
            fireplaceGainNode.connect(ctx.destination);
            fireplaceSourceNode.start(0);
            isFireplacePlaying = true;
        }
    } catch (err) {
        console.warn('[CozyMode] 벽난로 시작 실패:', err);
    }
}

function stopFireplace() {
    try {
        if (fireplaceSourceNode) {
            fireplaceSourceNode.stop();
            fireplaceSourceNode.disconnect();
            fireplaceSourceNode = null;
        }
        if (fireplaceGainNode) {
            fireplaceGainNode.disconnect();
            fireplaceGainNode = null;
        }
        isFireplacePlaying = false;
    } catch (e) { }
}

async function toggleLibrary() {
    const btn = document.getElementById('playLibraryBtn');
    if (isLibraryPlaying) {
        stopLibrary();
        if (btn) btn.textContent = '▶';
        window.CozyParticles?.deactivate('library');
    } else {
        await startLibrary();
        if (btn) btn.textContent = '⏸';
        window.CozyParticles?.activate('library');
    }
}

async function startLibrary() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        if (!libraryAudioBuffer) {
            const resp = await fetch('sounds/bgm/Library.mp3');
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                libraryAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
            }
        }

        if (libraryAudioBuffer && !librarySourceNode) {
            librarySourceNode = ctx.createBufferSource();
            librarySourceNode.buffer = libraryAudioBuffer;
            librarySourceNode.loop = true;

            libraryGainNode = ctx.createGain();
            const savedVol = parseFloat(localStorage.getItem('cozyLibraryVol') || '0.3');
            libraryGainNode.gain.value = savedVol;

            librarySourceNode.connect(libraryGainNode);
            libraryGainNode.connect(ctx.destination);
            librarySourceNode.start(0);
            isLibraryPlaying = true;
        }
    } catch (err) {
        console.warn('[CozyMode] 도서관 시작 실패:', err);
    }
}

function stopLibrary() {
    try {
        if (librarySourceNode) {
            librarySourceNode.stop();
            librarySourceNode.disconnect();
            librarySourceNode = null;
        }
        if (libraryGainNode) {
            libraryGainNode.disconnect();
            libraryGainNode = null;
        }
        isLibraryPlaying = false;
    } catch (e) { }
}

function stopCozyAudio() {
    stopRain();
    stopFire();
    stopFireplace();
    stopLibrary();
    const btnRain = document.getElementById('playRainBtn');
    if (btnRain) btnRain.textContent = '▶';
    const btnFire = document.getElementById('playFireBtn');
    if (btnFire) btnFire.textContent = '▶';
    const btnFireplace = document.getElementById('playFireplaceBtn');
    if (btnFireplace) btnFireplace.textContent = '▶';
    const btnLibrary = document.getElementById('playLibraryBtn');
    if (btnLibrary) btnLibrary.textContent = '▶';
    window.CozyParticles?.deactivateAll();
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

function setFireplaceVolume(value) {
    if (fireplaceGainNode) {
        fireplaceGainNode.gain.value = value;
    }
    localStorage.setItem('cozyFireplaceVol', value);
}

function setLibraryVolume(value) {
    if (libraryGainNode) {
        libraryGainNode.gain.value = value;
    }
    localStorage.setItem('cozyLibraryVol', value);
}

window.initCozyMode = initCozyMode;
window.toggleCozyMode = toggleCozyMode;
window.openCozyPanel = openCozyPanel;

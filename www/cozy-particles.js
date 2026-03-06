// ==============================================
// CozyParticles - Canvas Particle Component
// 코지 모드 사운드별 파티클 이펙트
// ==============================================

const CozyParticles = (() => {

    // ── 상수 ─────────────────────────────────────
    const MAX_PARTICLES = 1200;
    const FADE_DURATION = 1200; // ms

    // ── 프리셋 정의 ───────────────────────────────
    const PRESETS = {
        rain: {
            spawnRate: 0.18,       // particles/ms
            maxOpacity: 0.55,
            getParticle(W, H) {
                const vy = 0.4 + Math.random() * 0.25;
                const vx = -vy * 0.35;
                return {
                    x: Math.random() * (W + 120) - 60,
                    y: Math.random() * -30 - 5,
                    vx,
                    vy,
                    wobbleAmp: 0,
                    wobbleSpeed: 0,
                    wobble: 0,
                    size: 0.8 + Math.random() * 0.6,
                    length: 9 + Math.random() * 12,
                    life: 1,
                    decay: 0,
                    r: 180, g: 210, b: 240,
                };
            },
            draw(ctx, p, alpha) {
                const nx = p.vx / Math.hypot(p.vx, p.vy);
                const ny = p.vy / Math.hypot(p.vx, p.vy);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
                ctx.lineWidth = p.size;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + nx * p.length, p.y + ny * p.length);
                ctx.stroke();
            },
        },

        fire: {
            spawnRate: 0.05,
            maxOpacity: 0.7,
            getParticle(W, H) {
                const isGrey = Math.random() > 0.4;
                return {
                    x: W * 0.3 + Math.random() * W * 0.4,
                    y: H + Math.random() * 10,
                    vx: (Math.random() - 0.5) * 0.06,
                    vy: -(0.05 + Math.random() * 0.12),
                    wobbleAmp: 6 + Math.random() * 10,
                    wobbleSpeed: 1.5 + Math.random() * 2.0,
                    wobble: Math.random() * Math.PI * 2,
                    size: 1.5 + Math.random() * 2.5,
                    length: 0,
                    life: 1,
                    decay: 0.0008 + Math.random() * 0.0008,
                    r: isGrey ? 150 : 210,
                    g: isGrey ? 120 : 140,
                    b: isGrey ? 90 : 60,
                };
            },
            draw(ctx, p, alpha) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            },
        },

        fireplace: {
            spawnRate: 0.025,
            maxOpacity: 0.6,
            getParticle(W, H) {
                return {
                    x: W * 0.15 + Math.random() * W * 0.7,
                    y: H + Math.random() * 20,
                    vx: (Math.random() - 0.5) * 0.04,
                    vy: -(0.025 + Math.random() * 0.07),
                    wobbleAmp: 18 + Math.random() * 18,
                    wobbleSpeed: 0.5 + Math.random() * 0.9,
                    wobble: Math.random() * Math.PI * 2,
                    size: 2.5 + Math.random() * 3.0,
                    length: 0,
                    life: 1,
                    decay: 0.0004 + Math.random() * 0.0006,
                    r: 210, g: 185, b: 145,
                };
            },
            draw(ctx, p, alpha) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            },
        },

        library: {
            spawnRate: 0.007,
            maxOpacity: 0.25,
            getParticle(W, H) {
                return {
                    x: Math.random() * W,
                    y: Math.random() * -15,
                    vx: (Math.random() - 0.5) * 0.01,
                    vy: 0.02 + Math.random() * 0.05,
                    wobbleAmp: 3 + Math.random() * 6,
                    wobbleSpeed: 0.2 + Math.random() * 0.5,
                    wobble: Math.random() * Math.PI * 2,
                    size: 0.8 + Math.random() * 1.2,
                    length: 0,
                    life: 1,
                    decay: 0.0002 + Math.random() * 0.0004,
                    r: 220, g: 220, b: 210,
                };
            },
            draw(ctx, p, alpha) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            },
        },
    };

    // ── Canvas & Context ───────────────────────────
    let canvas, ctx;
    let W = 0, H = 0;

    // ── 파티클 풀 (pre-allocate) ───────────────────
    const pool = Array.from({ length: MAX_PARTICLES }, () => ({ alive: false }));
    let aliveCount = 0; // O(1) 활성 파티클 카운터

    // ── 활성 프리셋 상태 맵 ────────────────────────
    // { name -> { opacity, fadingIn, fadingOut, spawnAccum } }
    const activePresets = new Map();

    // ── rAF ──────────────────────────────────────
    let rafId = null;
    let lastTime = 0;

    // ── 내부 함수 ─────────────────────────────────

    function initCanvas() {
        canvas = document.getElementById('cozy-particles-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'cozy-particles-canvas';
            canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
            document.body.insertBefore(canvas, document.body.firstChild);
        }
        ctx = canvas.getContext('2d');
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
    }

    function handleResize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function getSlot() {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (!pool[i].alive) return pool[i];
        }
        return null;
    }

    function spawnParticle(name) {
        const preset = PRESETS[name];
        if (!preset) return;
        const slot = getSlot();
        if (!slot) return;
        const p = preset.getParticle(W, H);
        Object.assign(slot, p, { alive: true, preset: name });
        aliveCount++;
    }

    function loop(timestamp) {
        const dt = Math.min(timestamp - lastTime, 50);
        lastTime = timestamp;

        ctx.clearRect(0, 0, W, H);

        // 프리셋별 fade & spawn
        for (const [name, state] of activePresets) {
            const preset = PRESETS[name];

            // fade in/out
            if (state.fadingIn) {
                state.opacity = Math.min(1, state.opacity + dt / FADE_DURATION);
                if (state.opacity >= 1) state.fadingIn = false;
            }
            if (state.fadingOut) {
                state.opacity = Math.max(0, state.opacity - dt / FADE_DURATION);
                if (state.opacity <= 0) {
                    activePresets.delete(name);
                    continue;
                }
            }

            // spawn
            if (!state.fadingOut) {
                state.spawnAccum += dt * preset.spawnRate;
                const count = Math.floor(state.spawnAccum);
                state.spawnAccum -= count;
                for (let i = 0; i < count; i++) spawnParticle(name);
            }
        }

        // 파티클 업데이트 & 드로우
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const p = pool[i];
            if (!p.alive) continue;

            const state = activePresets.get(p.preset);
            if (!state) { p.alive = false; continue; }

            // 위치 업데이트
            p.wobble += p.wobbleSpeed * dt * 0.001;
            p.x += (p.vx + Math.sin(p.wobble) * p.wobbleAmp * 0.001) * dt;
            p.y += p.vy * dt;

            // life 감소
            if (p.decay > 0) p.life = Math.max(0, p.life - p.decay * dt);

            // 화면 밖 or 수명 다하면 제거
            if (p.life <= 0 || p.y > H + 20 || p.y < -100 || p.x < -80 || p.x > W + 80) {
                p.alive = false;
                aliveCount--;
                continue;
            }

            const alpha = p.life * state.opacity * PRESETS[p.preset].maxOpacity;
            if (alpha > 0.01) PRESETS[p.preset].draw(ctx, p, alpha);
        }

        // 루프 지속 여부 판단
        if (activePresets.size > 0 || aliveCount > 0) {
            rafId = requestAnimationFrame(loop);
        } else {
            rafId = null;
        }
    }

    function startLoop() {
        if (!canvas) initCanvas();
        if (!rafId) {
            lastTime = performance.now();
            rafId = requestAnimationFrame(loop);
        }
    }

    // ── Public API ────────────────────────────────

    function activate(name) {
        if (!PRESETS[name]) return;
        if (activePresets.has(name)) {
            const s = activePresets.get(name);
            s.fadingOut = false;
            s.fadingIn = true;
            return;
        }
        activePresets.set(name, { opacity: 0, fadingIn: true, fadingOut: false, spawnAccum: 0 });
        startLoop();
    }

    function deactivate(name) {
        const state = activePresets.get(name);
        if (!state) return;
        state.fadingIn = false;
        state.fadingOut = true;
    }

    function deactivateAll() {
        for (const [name, state] of activePresets) {
            state.fadingIn = false;
            state.fadingOut = true;
        }
    }

    function isActive(name) {
        const s = activePresets.get(name);
        return !!s && !s.fadingOut;
    }

    // DOM 준비되면 캔버스 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCanvas);
    } else {
        initCanvas();
    }

    return { activate, deactivate, deactivateAll, isActive };

})();

window.CozyParticles = CozyParticles;

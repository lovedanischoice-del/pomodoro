// ============================================================
// share-card.js — FOCUS PERFORMANCE CARD (Twitter 2:1)
// Canvas 1200×600 렌더 + PNG 다운로드 + 트위터 공유
// ============================================================

(function () {
    'use strict';

    const W = 1200, H = 600;

    // ── 뺑수 레벨별 파라미터 ──────────────────────────────────
    const PENGUIN_LEVELS = [
        { minSessions: 0, glowRadius: 0, ringCount: 0, auraColor: null },
        { minSessions: 1, glowRadius: 0, ringCount: 0, auraColor: null },
        { minSessions: 2, glowRadius: 28, ringCount: 0, auraColor: 'rgba(255,200,50,0.35)' },
        { minSessions: 3, glowRadius: 42, ringCount: 1, auraColor: 'rgba(255,120,80,0.4)' },
        { minSessions: 4, glowRadius: 60, ringCount: 2, auraColor: 'rgba(180,80,255,0.45)' },
        { minSessions: 5, glowRadius: 80, ringCount: 3, auraColor: 'rgba(80,200,255,0.5)' },
    ];

    function getPenguinLevel(sessions) {
        let lvl = PENGUIN_LEVELS[0];
        for (const l of PENGUIN_LEVELS) {
            if (sessions >= l.minSessions) lvl = l;
        }
        return lvl;
    }

    // ── 배경 렌더 ──────────────────────────────────────────────
    function drawBackground(ctx) {
        // 어두운 라디얼 그라데이션
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#06020f');
        bg.addColorStop(0.45, '#0d0720');
        bg.addColorStop(1, '#130828');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 미묘한 노이즈 레이어 (투명 사각 패턴)
        ctx.save();
        ctx.globalAlpha = 0.03;
        for (let x = 0; x < W; x += 40) {
            for (let y = 0; y < H; y += 40) {
                if ((x + y) % 80 === 0) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        ctx.restore();

        // 네온 그리드 선 (가로/세로)
        ctx.save();
        ctx.strokeStyle = 'rgba(120,60,255,0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 60) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 60) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        ctx.restore();

        // 좌측 대각선 배경 분리선
        ctx.save();
        const divGrad = ctx.createLinearGradient(440, 0, 500, H);
        divGrad.addColorStop(0, 'transparent');
        divGrad.addColorStop(0.5, 'rgba(150,80,255,0.3)');
        divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(460, 0);
        ctx.lineTo(440, H);
        ctx.stroke();
        ctx.restore();
    }

    // ── 집중 레이더 원 (좌측) ─────────────────────────────────
    function drawRadar(ctx, cx, cy, sessions) {
        const colors = [
            'rgba(180,80,255,0.18)',
            'rgba(120,80,255,0.22)',
            'rgba(80,200,255,0.15)',
        ];
        const radii = [160, 120, 85];

        ctx.save();
        radii.forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 대시 원
            ctx.setLineDash([8, 14]);
            ctx.beginPath();
            ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // 세션 수에 따른 채워진 아크
        if (sessions > 0) {
            const pct = Math.min(sessions / 8, 1);
            const neonGrad = ctx.createConicalGradient
                ? ctx.createConicalGradient(cx, cy, -Math.PI / 2)
                : null;

            ctx.beginPath();
            ctx.arc(cx, cy, 145, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
            ctx.strokeStyle = 'rgba(150,80,255,0.9)';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.shadowColor = '#a050ff';
            ctx.shadowBlur = 14;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineCap = 'butt';
        }
        ctx.restore();
    }

    // ── 뺑수 캐릭터 (Canvas 드로잉) ──────────────────────────
    function drawPenguin(ctx, cx, cy, lvl) {
        ctx.save();

        // 오라 글로우 (레벨별)
        if (lvl.auraColor && lvl.glowRadius > 0) {
            const auraGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, lvl.glowRadius + 60);
            auraGrad.addColorStop(0, lvl.auraColor);
            auraGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, lvl.glowRadius + 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // 네온 링 (레벨 4+)
        for (let i = 0; i < lvl.ringCount; i++) {
            const r = 78 + i * 24;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            const ringColors = ['#a050ff', '#50c8ff', '#ff6880'];
            ctx.strokeStyle = ringColors[i % ringColors.length];
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.7 - i * 0.15;
            ctx.shadowColor = ringColors[i % ringColors.length];
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // 🐧 이모지 크게 렌더 (Canvas에서 이모지 사용)
        ctx.font = '120px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 글로우 효과
        if (lvl.glowRadius > 0) {
            ctx.shadowColor = lvl.auraColor || 'rgba(150,80,255,0.8)';
            ctx.shadowBlur = 30;
        }
        ctx.fillText('🐧', cx, cy + 10);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // ── 우측 메인 텍스트 ──────────────────────────────────────
    function drawMainContent(ctx, data) {
        const rx = 500; // 우측 시작 x
        const cw = W - rx; // 우측 폭 (700px)
        const midX = rx + cw / 2;

        // ─ 상단 헤더 바 ─
        ctx.save();
        const headerGrad = ctx.createLinearGradient(rx, 0, W, 0);
        headerGrad.addColorStop(0, 'rgba(100,40,200,0.3)');
        headerGrad.addColorStop(1, 'rgba(40,10,80,0.1)');
        ctx.fillStyle = headerGrad;
        ctx.fillRect(rx, 0, cw, 68);
        ctx.restore();

        // 헤더 라벨
        ctx.save();
        ctx.font = 'bold 13px "Arial", sans-serif';
        ctx.fillStyle = 'rgba(180,140,255,0.9)';
        ctx.textAlign = 'left';
        ctx.letterSpacing = '3px';
        ctx.fillText('DAILY LOCK-IN REPORT', rx + 28, 30);

        // 날짜 (우측 정렬)
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(200,180,255,0.6)';
        ctx.font = '12px "Arial", sans-serif';
        ctx.fillText(dateStr, W - 24, 30);
        ctx.restore();

        // ─ 닉네임 ─
        ctx.save();
        ctx.font = 'bold 18px "Arial", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`@${data.nickname || 'Bbangmodoro'}`, rx + 28, 58);
        ctx.restore();

        // ─ 메인 숫자 (+160 MIN) ─
        const mainY = 260;

        // 시간 계산
        const totalMin = data.minutesTotal || 0;
        let mainLabel, mainValue;
        if (totalMin >= 60) {
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            mainValue = m > 0 ? `${h}H ${m}M` : `${h}H`;
            mainLabel = 'LOCKED IN';
        } else {
            mainValue = `+${totalMin}`;
            mainLabel = 'MIN';
        }

        // 뒤 글로우 레이어
        ctx.save();
        ctx.font = 'bold 110px "Arial Black", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(180,80,255,0.12)';
        ctx.fillText(mainValue, midX + 2, mainY + 2);

        // 메인 텍스트
        const numGrad = ctx.createLinearGradient(midX - 200, mainY - 90, midX + 200, mainY);
        numGrad.addColorStop(0, '#ffffff');
        numGrad.addColorStop(0.5, '#e8d0ff');
        numGrad.addColorStop(1, '#c080ff');
        ctx.fillStyle = numGrad;
        ctx.shadowColor = 'rgba(180,80,255,0.6)';
        ctx.shadowBlur = 20;
        ctx.fillText(mainValue, midX, mainY);
        ctx.shadowBlur = 0;
        ctx.restore();

        // MIN / LOCKED IN 서브 라벨
        ctx.save();
        ctx.font = 'bold 28px "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(200,160,255,0.85)';
        ctx.letterSpacing = '8px';
        ctx.fillText(mainLabel, midX, mainY + 46);
        ctx.restore();

        // ─ 구분선 ─
        ctx.save();
        const lineGrad = ctx.createLinearGradient(rx + 28, 0, W - 28, 0);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.2, 'rgba(150,80,255,0.6)');
        lineGrad.addColorStop(0.8, 'rgba(80,160,255,0.4)');
        lineGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx + 28, 330);
        ctx.lineTo(W - 28, 330);
        ctx.stroke();
        ctx.restore();

        // ─ 하단 스탯 배지들 ─
        const badgeY = 390;

        // 🔥 세션 수
        _drawBadge(ctx, rx + 80, badgeY, `🔥 ${data.sessions || 0} SESSION${(data.sessions || 0) !== 1 ? 'S' : ''}`, '#ff6060', 'rgba(255,60,60,0.2)');

        // LV.N
        _drawBadge(ctx, rx + 280, badgeY, `LV.${data.level || 1} FOCUS`, '#c080ff', 'rgba(150,60,255,0.2)');

        // STREAK
        _drawBadge(ctx, rx + 470, badgeY, `⚡ ${data.streak || 0}d STREAK`, '#50c8ff', 'rgba(50,150,255,0.2)');

        // ─ 레벨 칭호 ─
        ctx.save();
        ctx.font = 'bold 20px "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(220,200,255,0.8)';
        ctx.fillText(data.levelTitle || '🌱 새싹', midX, 460);
        ctx.restore();

        // ─ 하단 푸터 ─
        ctx.save();
        const footerGrad = ctx.createLinearGradient(rx, H - 60, W, H);
        footerGrad.addColorStop(0, 'rgba(60,20,120,0.4)');
        footerGrad.addColorStop(1, 'rgba(20,5,50,0.6)');
        ctx.fillStyle = footerGrad;
        ctx.fillRect(rx, H - 56, cw, 56);

        ctx.font = '12px "Arial", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(180,140,255,0.7)';
        ctx.fillText('bbangmodoro.app', rx + 28, H - 22);

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(160,120,220,0.6)';
        ctx.fillText('#집중 #뽀모도로 #Pomodoro', W - 24, H - 22);
        ctx.restore();
    }

    function _drawBadge(ctx, x, y, text, color, bgColor) {
        ctx.save();
        ctx.font = 'bold 14px "Arial", sans-serif';
        ctx.textAlign = 'left';
        const metrics = ctx.measureText(text);
        const pad = 14;
        const bw = metrics.width + pad * 2;
        const bh = 36;

        // 배경
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y - bh / 2, bw, bh, 8);
        ctx.fill();

        // 테두리
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 텍스트
        ctx.fillStyle = color;
        ctx.fillText(text, x + pad, y + 5);
        ctx.restore();
    }

    // ── 전체 카드 렌더 ─────────────────────────────────────────
    function renderCard(canvas, data) {
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        drawBackground(ctx);

        const pcx = 220, pcy = 300;
        drawRadar(ctx, pcx, pcy, data.sessions || 0);

        const lvl = getPenguinLevel(data.sessions || 0);
        drawPenguin(ctx, pcx, pcy, lvl);

        drawMainContent(ctx, data);
    }

    // ── 공유 텍스트 생성 ──────────────────────────────────────
    function buildTweetText(data) {
        const min = data.minutesTotal || 0;
        const timeStr = min >= 60
            ? `${Math.floor(min / 60)}H ${min % 60}M`
            : `${min}MIN`;
        return [
            `🔥 +${timeStr} LOCKED IN`,
            `${data.sessions}세션 클리어 · 연속 ${data.streak}일`,
            `${data.levelTitle} MODE`,
            '',
            '#집중 #뽀모도로 #Pomodoro',
            'bbangmodoro.app'
        ].join('\n');
    }

    // ── 공개 API ──────────────────────────────────────────────
    window.shareCard = {
        render: renderCard,
        buildTweetText,
        open(data) {
            _openModal(data);
        }
    };

    function _openModal(data) {
        let modal = document.getElementById('shareCardModal');
        if (!modal) return;

        modal.classList.add('active');
        const canvas = document.getElementById('shareCanvas');
        renderCard(canvas, data);

        // 버튼 이벤트
        const tweetBtn = document.getElementById('scTweetBtn');
        const dlBtn = document.getElementById('scDownloadBtn');

        if (tweetBtn) {
            tweetBtn.onclick = () => {
                const text = encodeURIComponent(buildTweetText(data));
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            };
        }
        if (dlBtn) {
            dlBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = `focus-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        }

        // 닫기
        const closeBtn = document.getElementById('scCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };
    }

})();

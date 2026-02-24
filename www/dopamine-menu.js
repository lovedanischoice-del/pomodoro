// ==============================================
// 🍱 도파민 메뉴 선택기
// 휴식 시작 시 건강한 스낵 활동 제안 → 칭찬 배지
// ==============================================

const DOPAMINE_MENU = [
    { emoji: '🏋️', label: '스쿼트 5개', category: 'body' },
    { emoji: '🎵', label: '좋아하는 노래 1곡', category: 'mind' },
    { emoji: '💧', label: '물 한 컵 마시기', category: 'body' },
    { emoji: '🌿', label: '5번 심호흡', category: 'mind' },
    { emoji: '🪟', label: '창문 열고 바깥 보기', category: 'sense' },
    { emoji: '✍️', label: '감사한 것 1가지 적기', category: 'mind' },
    { emoji: '🤸', label: '목·어깨 스트레칭', category: 'body' },
    { emoji: '😴', label: '눈 감고 1분 쉬기', category: 'mind' },
];

const BADGES_KEY = 'dopamineBadges';

/**
 * 휴식 시작 시 도파민 메뉴 표시
 * @param {Function} onDone - 선택/스킵 후 콜백
 */
function showDopamineMenu(onDone) {
    const overlay = document.getElementById('dopamineMenuOverlay');
    if (!overlay) {
        if (onDone) onDone();
        return;
    }

    const grid = document.getElementById('dopamineGrid');
    const skipBtn = document.getElementById('dopamineSkipBtn');
    const badgeEl = document.getElementById('dopamineBadgeCount');

    // 매번 랜덤 4개 셔플해서 표시
    const shuffled = [...DOPAMINE_MENU].sort(() => Math.random() - 0.5).slice(0, 4);

    if (grid) {
        grid.innerHTML = shuffled.map((item, i) => `
            <button class="dopamine-item" data-index="${i}" onclick="selectDopamineItem(${i})">
                <span class="dopamine-emoji">${item.emoji}</span>
                <span class="dopamine-label">${item.label}</span>
            </button>
        `).join('');

        // 클릭 데이터 전달용
        window._dopamineItems = shuffled;
        window._dopamineOnDone = onDone;
    }

    // 배지 카운트
    const badges = getBadges();
    if (badgeEl) badgeEl.textContent = badges.length;

    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    // 스킵 버튼
    if (skipBtn) {
        skipBtn.onclick = () => dismissDopamineMenu(onDone);
    }

    // 15초 자동 스킵
    window._dopamineTimer = setTimeout(() => dismissDopamineMenu(onDone), 15000);
}

window.selectDopamineItem = function (index) {
    const item = window._dopamineItems?.[index];
    const onDone = window._dopamineOnDone;
    if (!item) return;

    clearTimeout(window._dopamineTimer);

    // 배지 저장
    const badges = getBadges();
    badges.unshift({ label: item.label, emoji: item.emoji, time: new Date().toISOString() });
    if (badges.length > 200) badges.pop();
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));

    // 칭찬 화면 전환
    showDopaminePraise(item, onDone);
};

function showDopaminePraise(item, onDone) {
    const overlay = document.getElementById('dopamineMenuOverlay');
    const contentEl = document.getElementById('dopamineContent');
    if (!contentEl) {
        dismissDopamineMenu(onDone);
        return;
    }

    const praises = [
        '최고예요! 🎉', '뺑수 대단해요! ✨', '완벽한 선택! 💪',
        '몸이 고마워할 거예요! 🌿', '훌륭해요, 진짜로! 🏆'
    ];
    const praise = praises[Math.floor(Math.random() * praises.length)];
    const totalBadges = getBadges().length;

    contentEl.innerHTML = `
        <div class="dopamine-praise-wrap">
            <div class="dopamine-praise-emoji">${item.emoji}</div>
            <div class="dopamine-praise-title">${praise}</div>
            <div class="dopamine-praise-desc"><strong>${item.label}</strong> 완료!</div>
            <div class="dopamine-badge-earned">
                🏅 총 <strong>${totalBadges}</strong>개 배지 획득
            </div>
        </div>
    `;

    // 2.5초 후 자동 닫기
    setTimeout(() => dismissDopamineMenu(onDone), 2500);
}

function dismissDopamineMenu(onDone) {
    clearTimeout(window._dopamineTimer);
    const overlay = document.getElementById('dopamineMenuOverlay');
    overlay?.classList.remove('active');
    overlay?.classList.add('hidden');
    if (onDone) onDone();
}

function getBadges() {
    return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');
}

window.showDopamineMenu = showDopamineMenu;
window.dismissDopamineMenu = dismissDopamineMenu;
window.getDopamineBadges = getBadges;

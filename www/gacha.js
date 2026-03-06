// ==============================================
// 🎰 랜덤 보상 가챠 시스템
// 세션 완료 시 확률 테이블로 아이템 추첨 → 컬렉션 저장
// ==============================================

const GACHA_STORAGE_KEY = 'gachaCollection';

// ─── 확률 테이블 ───────────────────────────────
// weight 합계 = 100
const GACHA_TABLE = [
    // ── common (70) ──
    { id: 'fish', emoji: '🐟', name: '뻐끔이', rarity: 'common', weight: 20, desc: '작지만 소중한 집중의 흔적' },
    { id: 'book', emoji: '📚', name: '공부 노트', rarity: 'common', weight: 20, desc: '지식이 쌓이고 있어요' },
    { id: 'coffee', emoji: '☕', name: '집중 커피', rarity: 'common', weight: 15, desc: '한 잔의 여유' },
    { id: 'leaf', emoji: '🍃', name: '초록 잎사귀', rarity: 'common', weight: 15, desc: '조용히 자라는 중' },
    // ── rare (25) ──
    { id: 'star', emoji: '⭐', name: '별빛 조각', rarity: 'rare', weight: 10, desc: '오늘 하루의 빛나는 순간' },
    { id: 'gem', emoji: '💎', name: '집중 젬', rarity: 'rare', weight: 8, desc: '희귀하게 빛나는 보석' },
    { id: 'rocket', emoji: '🚀', name: '집중 로켓', rarity: 'rare', weight: 7, desc: '몰입의 속도, 우주를 향해' },
    // ── legendary (5) ──
    { id: 'crown', emoji: '👑', name: '뺑수 왕관', rarity: 'legendary', weight: 3, desc: '진정한 집중의 왕' },
    { id: 'fire', emoji: '🔥', name: '불꽃 뺑수', rarity: 'legendary', weight: 2, desc: '당신은 전설이에요' },
];

const RARITY_LABEL = {
    common: { label: 'COMMON', color: '#9ca3af' },
    rare: { label: 'RARE', color: '#60a5fa' },
    legendary: { label: 'LEGENDARY', color: '#fbbf24' },
};

// ─── 가중치 랜덤 추첨 ──────────────────────────
function rollGacha() {
    const totalWeight = GACHA_TABLE.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const item of GACHA_TABLE) {
        rand -= item.weight;
        if (rand <= 0) return item;
    }
    return GACHA_TABLE[0];
}

function getCollection() {
    return JSON.parse(localStorage.getItem(GACHA_STORAGE_KEY) || '[]');
}

function saveToCollection(item) {
    const col = getCollection();
    col.unshift({
        ...item,
        obtainedAt: new Date().toISOString(),
        uid: Date.now()
    });
    if (col.length > 500) col.pop();
    localStorage.setItem(GACHA_STORAGE_KEY, JSON.stringify(col));
}

// ─── 가챠 실행 (외부 호출) ─────────────────────
/**
 * 세션 완료 시 호출 → 추첨 → 결과 오버레이 표시
 * @param {Function} onClose 닫기 후 콜백
 */
function openGachaBox(onClose) {
    if (!window.modalManager) {
        if (onClose) onClose();
        return;
    }

    // 상자 열기 애니메이션 단계
    const boxEl = document.getElementById('gachaBox');
    const resultCard = document.getElementById('gachaResultCard');
    const shimmer = document.getElementById('gachaShimmer');

    if (boxEl) boxEl.classList.remove('open');
    if (resultCard) resultCard.classList.add('hidden');

    window.modalManager.openModal('gachaOverlay');

    // 1초 후 상자 열기
    setTimeout(() => {
        if (boxEl) boxEl.classList.add('open');
        if (shimmer) shimmer.classList.add('active');

        // 0.8초 후 아이템 공개
        setTimeout(() => {
            const item = rollGacha();
            saveToCollection(item);
            showGachaResult(item, resultCard);
            if (shimmer) shimmer.classList.remove('active');
        }, 800);
    }, 600);

    // 닫기 버튼
    const closeBtn = document.getElementById('gachaCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            window.modalManager.closeModal('gachaOverlay');
            if (onClose) onClose();
        };
    }

    // 컬렉션 보기 버튼
    const colBtn = document.getElementById('gachaToCollectionBtn');
    if (colBtn) {
        colBtn.onclick = () => {
            window.modalManager.closeModal('gachaOverlay');
            // 컬렉션 탭으로 이동
            const navItem = document.querySelector('.nav-item[data-view="collectionView"]');
            if (navItem) navItem.click();
            if (onClose) onClose();
        };
    }
}

function showGachaResult(item, cardEl) {
    if (!cardEl) cardEl = document.getElementById('gachaResultCard');
    if (!cardEl) return;

    const rarity = RARITY_LABEL[item.rarity] || RARITY_LABEL.common;

    cardEl.innerHTML = `
        <div class="gacha-item-emoji" style="animation: gachaPop 0.5s cubic-bezier(0.34,1.56,0.64,1)">${item.emoji}</div>
        <div class="gacha-rarity-badge" style="color:${rarity.color}; border-color:${rarity.color}40;">${rarity.label}</div>
        <div class="gacha-item-name">${item.name}</div>
        <div class="gacha-item-desc">${item.desc}</div>
    `;
    cardEl.classList.remove('hidden');
    cardEl.style.setProperty('--rarity-color', rarity.color);
    cardEl.className = `gacha-result-card rarity-${item.rarity}`;
}

// ─── 컬렉션 뷰 렌더링 ─────────────────────────
function renderCollectionView() {
    const container = document.getElementById('collectionGrid');
    if (!container) return;

    const col = getCollection();

    if (col.length === 0) {
        container.innerHTML = `
            <div class="collection-empty">
                <div style="font-size:48px;">🎁</div>
                <p>아직 획득한 아이템이 없어요<br>세션을 완료하면 보상이 생겨요!</p>
            </div>`;
        return;
    }

    // 요약 카운트
    const countEl = document.getElementById('collectionCount');
    if (countEl) countEl.textContent = col.length;

    const legendaryCount = col.filter(i => i.rarity === 'legendary').length;
    const legendEl = document.getElementById('collectionLegendaryCount');
    if (legendEl) legendEl.textContent = legendaryCount;

    container.innerHTML = col.map(item => {
        const rarity = RARITY_LABEL[item.rarity] || RARITY_LABEL.common;
        const date = new Date(item.obtainedAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        return `
        <div class="collection-item rarity-${item.rarity}" title="${item.name}: ${item.desc}">
            <div class="collection-item-emoji">${item.emoji}</div>
            <div class="collection-item-name">${item.name}</div>
            <div class="collection-item-rarity" style="color:${rarity.color}">${rarity.label}</div>
            <div class="collection-item-date">${dateStr}</div>
        </div>`;
    }).join('');
}

window.openGachaBox = openGachaBox;
window.renderCollectionView = renderCollectionView;
window.getGachaCollection = getCollection;

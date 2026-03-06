// ==============================================
// 🐇 토끼굴 파킹 (Rabbit Hole Parking)
// 집중 중 떠오른 딴생각을 임시 보관, 세션 후 열람
// ==============================================

const RABBIT_STORAGE_KEY = 'rabbitHoleItems';

// 현재 잠금 상태 (집중 중 = locked)
let rabbitLocked = false;
let rabbitInputVisible = false;

let isRabbitHoleInitialized = false;

/**
 * 토끼굴 파킹 초기화 - DOMContentLoaded 후 호출
 */
function initRabbitHole() {
    if (isRabbitHoleInitialized) return;
    isRabbitHoleInitialized = true;

    const fabWrap = document.getElementById('rabbitHoleFab');
    const panel = document.getElementById('rabbitHolePanel');
    const inputEl = document.getElementById('rabbitInput');
    const saveBtn = document.getElementById('rabbitSaveBtn');
    const closeBtn = document.getElementById('rabbitCloseBtn');
    const badge = document.getElementById('rabbitBadge');

    if (!fabWrap) return;

    // FAB 클릭 → 패널 토글
    fabWrap.addEventListener('click', () => {
        if (rabbitLocked) {
            // 집중 중 → 빠른 입력 패널 토글
            rabbitInputVisible = !rabbitInputVisible;
            panel?.classList.toggle('hidden', !rabbitInputVisible);
            if (rabbitInputVisible) {
                inputEl?.focus();
            }
        } else {
            // 휴식/정지 중 → 보관함 열기
            openRabbitVault();
        }
    });

    // 저장 버튼
    saveBtn?.addEventListener('click', () => saveRabbitItem(inputEl, panel, badge));

    // 닫기 버튼
    closeBtn?.addEventListener('click', () => {
        panel?.classList.add('hidden');
        rabbitInputVisible = false;
    });

    // Enter 키
    inputEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveRabbitItem(inputEl, panel, badge);
        if (e.key === 'Escape') {
            panel?.classList.add('hidden');
            rabbitInputVisible = false;
        }
    });

    // 초기 배지
    updateRabbitBadge(badge);
}

function saveRabbitItem(inputEl, panel, badge) {
    const text = inputEl?.value?.trim();
    if (!text) return;

    const items = getItems();
    items.unshift({ text, time: new Date().toISOString(), reviewed: false });
    if (items.length > 100) items.pop();
    localStorage.setItem(RABBIT_STORAGE_KEY, JSON.stringify(items));

    inputEl.value = '';
    panel?.classList.add('hidden');
    rabbitInputVisible = false;

    updateRabbitBadge(badge);
    showRabbitSaveFeedback();
}

function openRabbitVault() {
    BbangModal.show({
        position: 'center',
        content: `
            <div class="bbang-modal-header">
                <span class="bbang-modal-title">🐇 파킹해 둔 생각들</span>
                <button class="bbang-modal-close" onclick="BbangModal.hide()">✕</button>
            </div>
            <ul id="rabbitVaultList" class="rabbit-vault-list"></ul>
            <button id="rabbitClearBtn" class="btn-rabbit-clear">모두 삭제</button>
        `,
        onReady: () => {
            renderVaultList(document.getElementById('rabbitVaultList'));
            const clearBtn = document.getElementById('rabbitClearBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    localStorage.removeItem(RABBIT_STORAGE_KEY);
                    renderVaultList(document.getElementById('rabbitVaultList'));
                    updateRabbitBadge(null);
                });
            }
        },
    });
}

function renderVaultList(listEl) {
    if (!listEl) return;
    const items = getItems();
    if (items.length === 0) {
        listEl.innerHTML = '<li class="rabbit-empty">아직 저장된 생각이 없어요 🐇</li>';
        return;
    }
    listEl.innerHTML = items.map((item, i) => {
        const date = new Date(item.time);
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return `
        <li class="rabbit-item">
            <span class="rabbit-item-text">${escapeHtml(item.text)}</span>
            <span class="rabbit-item-time">${timeStr}</span>
            <button class="rabbit-item-del" onclick="deleteRabbitItem(${i})">✕</button>
        </li>`;
    }).join('');
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateRabbitBadge(badge) {
    if (!badge) {
        badge = document.getElementById('rabbitBadge');
    }
    const count = getItems().length;
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function showRabbitSaveFeedback() {
    const fab = document.getElementById('rabbitHoleBtn');
    if (!fab) return;
    fab.textContent = '✅';
    setTimeout(() => { fab.textContent = '🐇'; }, 1200);
}

function getItems() {
    return JSON.parse(localStorage.getItem(RABBIT_STORAGE_KEY) || '[]');
}

window.deleteRabbitItem = function (index) {
    const items = getItems();
    items.splice(index, 1);
    localStorage.setItem(RABBIT_STORAGE_KEY, JSON.stringify(items));
    // BbangModal 내부의 목록 갱신
    const listEl = document.getElementById('rabbitVaultList');
    if (listEl) renderVaultList(listEl);
    updateRabbitBadge(null);
};

window.closeRabbitVault = function () {
    BbangModal.hide();
};

/**
 * 집중 시작 시 호출 → 잠금 모드
 */
function lockRabbitHole() {
    rabbitLocked = true;
    const fab = document.getElementById('rabbitHoleBtn');
    const fab_tip = document.getElementById('rabbitFabTip');
    if (fab) {
        fab.classList.add('locked');
        fab.title = '집중 중 — 생각 파킹하기';
    }
    if (fab_tip) fab_tip.textContent = '생각 던지기';

    // 혹시 열려있던 패널/보관함 닫기
    document.getElementById('rabbitHolePanel')?.classList.add('hidden');
    document.getElementById('rabbitVaultPanel')?.classList.remove('active');
    document.getElementById('rabbitVaultPanel')?.classList.add('hidden');
    rabbitInputVisible = false;
}

/**
 * 휴식/정지 시 호출 → 잠금 해제
 */
function unlockRabbitHole() {
    rabbitLocked = false;
    const fab = document.getElementById('rabbitHoleBtn');
    const fab_tip = document.getElementById('rabbitFabTip');
    if (fab) {
        fab.classList.remove('locked');
        fab.title = '파킹한 생각 보기';
    }
    if (fab_tip) fab_tip.textContent = '보관함 열기';

    // 저장된 아이템이 있으면 자동으로 보관함 팝업
    const items = getItems();
    if (items.length > 0) {
        setTimeout(() => openRabbitVault(), 800);
    }
}

window.initRabbitHole = initRabbitHole;
window.lockRabbitHole = lockRabbitHole;
window.unlockRabbitHole = unlockRabbitHole;

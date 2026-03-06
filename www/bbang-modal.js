// ==============================================
// 🍞 BbangModal - 통합 팝업 모달 시스템
// 하나의 DOM 요소를 재사용해 모든 팝업에 대응
// ==============================================

const BbangModal = (() => {
    let overlay, card;

    function init() {
        overlay = document.getElementById('bbang-modal');
        card = document.getElementById('bbang-modal-card');
        if (!overlay || !card) return;

        // 배경 클릭 시 닫기
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });

        // ESC 키 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        });
    }

    /**
     * 모달 열기
     * @param {Object} options
     * @param {'center'|'bottom'} options.position - 팝업 위치
     * @param {string} options.content - 삽입할 HTML 문자열
     * @param {Function} [options.onClose] - 닫힐 때 콜백
     * @param {Function} [options.onReady] - 콘텐츠 삽입 직후 콜백 (DOM 조작용)
     */
    function show({ position = 'center', content = '', onClose, onReady } = {}) {
        if (!overlay || !card) return;

        overlay.classList.remove('hidden', 'position-center', 'position-bottom');
        overlay.classList.add(`position-${position}`);
        card.innerHTML = content;

        if (onReady) onReady(card);

        overlay._onClose = onClose || null;

        // 다음 프레임에 active 클래스 추가 (CSS transition 동작)
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    /**
     * 모달 닫기
     */
    function hide() {
        if (!overlay) return;
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.classList.add('hidden');
            if (card) card.innerHTML = '';
            if (overlay._onClose) {
                overlay._onClose();
                overlay._onClose = null;
            }
        }, 300);
    }

    document.addEventListener('DOMContentLoaded', init);

    return { show, hide };
})();

window.BbangModal = BbangModal;

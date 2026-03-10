// ==============================================
// 📦 Common Modal Manager
// ==============================================

const modalManager = {
    init: function () {
        // 배경(오버레이) 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                // 현재 활성화된 모달을 찾아서 닫음
                const activeModalOverlay = document.querySelector('.modal-overlay.active');
                if (activeModalOverlay) {
                    const modalId = activeModalOverlay.querySelector('.modal-container')?.id;
                    if (modalId) {
                        this.closeModal(modalId);
                    } else {
                        // 모달 컨테이너가 없더라도 오버레이 자체는 닫음
                        activeModalOverlay.classList.remove('active');
                    }
                }
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModalOverlay = document.querySelector('.modal-overlay.active');
                if (activeModalOverlay) {
                    const modalId = activeModalOverlay.querySelector('.modal-container')?.id;
                    if (modalId) {
                        this.closeModal(modalId);
                    } else {
                        activeModalOverlay.classList.remove('active');
                    }
                }
            }
        });
    },

    openModal: function (modalId) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;

        // 모달 엘리먼트를 감싸는 부모 오버레이 찾기 (없으면 경고)
        const overlay = modalEl.closest('.modal-overlay');
        if (overlay) {
            overlay.classList.add('active');
        } else {
            console.warn(`[modalManager] Modal '${modalId}' is missing '.modal-overlay' parent wrapper.`);
            // 호환성을 위해 혹시 오버레이 없이 바로 active를 줘야 할 경우:
            modalEl.classList.add('active');
            modalEl.classList.remove('hidden');
        }
    },

    closeModal: function (modalId) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;

        const overlay = modalEl.closest('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        } else {
            modalEl.classList.remove('active');
            modalEl.classList.add('hidden');
        }
    }
};

window.modalManager = modalManager;

document.addEventListener('DOMContentLoaded', () => {
    modalManager.init();
});

// ==============================================
// 🐧 뺑수 펭귄 - 바디 더블링 ON/OFF 토글
// 클릭 시 바디더블링 세션 참가/나가기만 담당
// ==============================================

class PenguinBuddy {
    constructor() {
        this.el = document.getElementById('penguinBuddy');
        this.sprite = document.getElementById('penguinSprite');
        this.bubble = document.getElementById('penguinBubble');
        this.isJoined = false; // 바디더블링 참여 여부
    }

    init() {
        if (!this.el) return;
        this._show();

        // 클릭 시 바디더블링 ON/OFF 토글
        this.el.addEventListener('click', () => {
            if (this.isJoined) {
                // OFF: 세션 나가기
                if (window.leaveBodyDoubleSession) {
                    window.leaveBodyDoubleSession();
                }
                this.isJoined = false;
                this._showBubble('', 0); // 말풍선 즉시 숨김
                this._hideBubble();
                this.el.classList.remove('penguin-joined');
            } else {
                // ON: 세션 참가
                if (window.joinBodyDoubleSession) {
                    window.joinBodyDoubleSession();
                }
                this.isJoined = true;
                this._showBubble('다른 친구들과 함께 공부를 시작해요 🐧', 3000);
                this.el.classList.add('penguin-joined');
            }
        });
    }

    _show() { this.el?.classList.remove('hidden'); }

    _showBubble(text, duration = 2500) {
        if (!this.bubble) return;
        this.bubble.textContent = text;
        this.bubble.classList.remove('hidden');
        this.bubble.classList.add('visible');
        clearTimeout(this._bubbleTimer);
        if (duration > 0) {
            this._bubbleTimer = setTimeout(() => this._hideBubble(), duration);
        }
    }

    _hideBubble() {
        if (!this.bubble) return;
        this.bubble.classList.remove('visible');
        this.bubble.classList.add('hidden');
    }

    // main.js 에서 호출하는 메서드들 — 이제는 아무것도 않함 (메시지 제거)
    startWork() { }
    startRest() { }
}

// 전역 인스턴스
const penguinBuddy = new PenguinBuddy();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => penguinBuddy.init(), 500);
});

window.penguinBuddy = penguinBuddy;

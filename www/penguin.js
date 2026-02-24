// ==============================================
// 🐧 뺑수 펭귄 - 바디 더블링
// 우하단 펭귄 마스코트, 비활동 감지 시 집중 유도
// ==============================================

class PenguinBuddy {
    constructor() {
        this.el = document.getElementById('penguinBuddy');
        this.sprite = document.getElementById('penguinSprite');
        this.bubble = document.getElementById('penguinBubble');
        this.state = 'idle'; // idle | working | watching | countdown
        this.timerId = null;
        this.countdownId = null;
        this.lastActivity = Date.now();
        this.isWorkSession = false;
        this.countNum = 5;
        this.enabled = true;
        this._boundActivity = () => this._onActivity();
    }

    init() {
        if (!this.el) return;
        this._watchActivity();
        this._show();
        this.setState('idle');
    }

    _show() { this.el.classList.remove('hidden'); }
    _hide() { this.el.classList.add('hidden'); }

    _watchActivity() {
        document.addEventListener('mousemove', this._boundActivity, { passive: true });
        document.addEventListener('keydown', this._boundActivity, { passive: true });
        document.addEventListener('click', this._boundActivity, { passive: true });
    }

    _onActivity() {
        this.lastActivity = Date.now();
        // 카운트다운 중이었으면 → 칭찬하고 working으로 복귀
        if (this.state === 'countdown' || this.state === 'watching') {
            this._resetCountdown();
            if (this.isWorkSession) {
                this.setState('working');
                this._showBubble('👍 잘하고 있어요!', 2000);
            }
        }
    }

    setState(state) {
        if (!this.el) return;
        this.state = state;
        const states = ['idle', 'working', 'watching', 'countdown'];
        states.forEach(s => this.el.classList.remove('penguin-' + s));
        this.el.classList.add('penguin-' + state);

        const emojis = {
            idle: '🐧',
            working: '🐧',
            watching: '👀',
            countdown: '⏰',
        };
        if (this.sprite) this.sprite.textContent = emojis[state] || '🐧';
    }

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

    _resetCountdown() {
        clearInterval(this.countdownId);
        this.countdownId = null;
        this.countNum = 5;
    }

    /**
     * 워크 세션 시작 → 펭귄 집중 모드
     */
    startWork() {
        if (!this.enabled || !this.el) return;
        this.isWorkSession = true;
        this._clearTimers();
        this.setState('working');
        this._showBubble('같이 집중해요! 💪', 2500);

        // 비활동 감지 루프
        this.timerId = setInterval(() => this._checkIdle(), 5000);
    }

    /**
     * 휴식/정지 → 펭귄 휴식 모드
     */
    startRest() {
        if (!this.el) return;
        this.isWorkSession = false;
        this._clearTimers();
        this._resetCountdown();
        this.setState('idle');
        this._showBubble('수고했어요! 🌊', 2500);
    }

    _clearTimers() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    _checkIdle() {
        if (!this.isWorkSession) return;
        const idle = Date.now() - this.lastActivity;

        if (idle > 40000 && this.state === 'working') {
            // 40초 비활동 → 쳐다보기
            this.setState('watching');
            this._showBubble('🤔 집중하고 있어요?', 0);
        } else if (idle > 60000 && this.state === 'watching') {
            // 60초 비활동 → 카운트다운
            this._startCountdown();
        }
    }

    _startCountdown() {
        if (this.state === 'countdown') return;
        this.setState('countdown');
        this.countNum = 5;
        this._showBubble(`5.. 4.. 3..`, 0);

        this.countdownId = setInterval(() => {
            this.countNum--;
            if (this.countNum <= 0) {
                clearInterval(this.countdownId);
                this.countdownId = null;
                // 아직도 안 움직이면 다시 watching으로
                this.setState('watching');
                this._showBubble('🐧 얼른 시작해봐요!', 3000);
                // watching으로 돌아가서 다시 대기
                setTimeout(() => {
                    if (this.isWorkSession) this.setState('working');
                    this._hideBubble();
                    this.lastActivity = Date.now(); // 리셋해서 반복 방지
                }, 3500);
            } else {
                this._showBubble(`${this.countNum}.. ⏰`, 0);
            }
        }, 1000);
    }
}

// 전역 인스턴스
const penguinBuddy = new PenguinBuddy();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => penguinBuddy.init(), 500);
});

window.penguinBuddy = penguinBuddy;

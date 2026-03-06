// ==============================================
// Leaderboard Manager
// ==============================================

class LeaderboardManager {
    constructor() {
        this.currentPeriod = 'weekly'; // 'weekly' | 'monthly' | 'alltime'
        this.leaderboardData = [];
        this.isLoading = false;
        this.currentUserRank = null;
        this.unsubscribe = null;
    }

    // 현재 유저의 집중 시간을 Firebase에 업로드
    async uploadUserStats() {
        if (!window.db || !window.auth || !window.auth.currentUser) return;

        const user = window.auth.currentUser;
        const statsManager = window.statsManager;
        if (!statsManager) return;

        try {
            const today = this.getTodayStats(statsManager);
            const weekly = this.getWeeklyTotal(statsManager);
            const monthly = this.getMonthlyTotal(statsManager);
            const alltime = Math.round(statsManager.sessions
                .filter(s => s.type === 'work')
                .reduce((sum, s) => sum + s.duration, 0));
            const streak = statsManager.getStreak();

            const userRef = window.db.collection('leaderboard').doc(user.uid);
            await userRef.set({
                uid: user.uid,
                displayName: user.displayName || '익명',
                photoURL: user.photoURL || null,
                todayMinutes: today,
                weeklyMinutes: weekly,
                monthlyMinutes: monthly,
                alltimeMinutes: alltime,
                streak: streak,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('리더보드 업로드 완료');
        } catch (error) {
            console.error('리더보드 업로드 오류:', error);
        }
    }

    getTodayStats(statsManager) {
        const today = new Date().toISOString().split('T')[0];
        return Math.round(statsManager.sessions
            .filter(s => s.date.startsWith(today) && s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0));
    }

    getWeeklyTotal(statsManager) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return Math.round(statsManager.sessions
            .filter(s => new Date(s.date) >= weekAgo && s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0));
    }

    getMonthlyTotal(statsManager) {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return Math.round(statsManager.sessions
            .filter(s => new Date(s.date) >= monthAgo && s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0));
    }

    // Firebase에서 리더보드 데이터 가져오기
    async fetchLeaderboard(period = 'weekly') {
        if (!window.db) {
            this.showOfflineMessage();
            return;
        }

        this.isLoading = true;
        this.renderLoadingState();

        const fieldMap = {
            weekly: 'weeklyMinutes',
            monthly: 'monthlyMinutes',
            alltime: 'alltimeMinutes'
        };

        const sortField = fieldMap[period] || 'weeklyMinutes';

        try {
            const snapshot = await window.db.collection('leaderboard')
                .orderBy(sortField, 'desc')
                .limit(50)
                .get();

            this.leaderboardData = [];
            snapshot.forEach(doc => {
                this.leaderboardData.push({ id: doc.id, ...doc.data() });
            });

            this.isLoading = false;
            this.renderLeaderboard(period);

            // 50위 밖 사용자라면 별도로 순위 조회
            const currentUserUid = window.auth?.currentUser?.uid;
            const inTop50 = this.leaderboardData.some(item => item.uid === currentUserUid);
            if (currentUserUid && !inTop50) {
                this.fetchMyRank(period, sortField);
            }

        } catch (error) {
            console.error('리더보드 로드 오류:', error);
            this.isLoading = false;
            this.renderErrorState(error);
        }
    }

    // 50위 밖 사용자의 실제 순위 조회
    async fetchMyRank(period, sortField) {
        const currentUserUid = window.auth?.currentUser?.uid;
        if (!currentUserUid || !window.db) return;

        try {
            const myDoc = await window.db.collection('leaderboard').doc(currentUserUid).get();
            if (!myDoc.exists) return;

            const myScore = myDoc.data()[sortField] || 0;
            const aboveSnapshot = await window.db.collection('leaderboard')
                .where(sortField, '>', myScore)
                .get();

            this.currentUserRank = aboveSnapshot.size + 1;
            this.currentUserData = myDoc.data();

            // UI 업데이트
            const myRankEl = document.getElementById('myRankValue');
            const myTimeEl = document.getElementById('myRankTime');
            const myStreakEl = document.getElementById('myRankStreak');
            const myRankNameEl = document.getElementById('myRankName');
            const myRankAvatarContainerEl = document.getElementById('myRankAvatarContainer');

            if (myRankEl) myRankEl.textContent = `#${this.currentUserRank}`;
            if (myTimeEl) myTimeEl.textContent = this.formatTime(myScore);
            if (myStreakEl) myStreakEl.textContent = this.currentUserData.streak ? `🔥 ${this.currentUserData.streak}일 연속` : '';
            if (myRankNameEl) myRankNameEl.textContent = this.currentUserData.displayName || '내 순위';
            if (myRankAvatarContainerEl) {
                if (this.currentUserData.photoURL) {
                    myRankAvatarContainerEl.innerHTML = `<img src="${this.currentUserData.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else {
                    const initial = (this.currentUserData.displayName || '?').charAt(0).toUpperCase();
                    myRankAvatarContainerEl.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;background:#6366f1;color:white;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;">${initial}</div>`;
                }
            }
        } catch (e) {
            console.warn('내 순위 조회 실패:', e);
        }
    }

    formatTime(minutes) {
        if (!minutes || minutes === 0) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    getMedalEmoji(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    }

    getRankStyle(rank) {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return '';
    }

    getFieldByPeriod(item, period) {
        if (period === 'weekly') return item.weeklyMinutes || 0;
        if (period === 'monthly') return item.monthlyMinutes || 0;
        if (period === 'alltime') return item.alltimeMinutes || 0;
        return item.weeklyMinutes || 0;
    }

    renderLoadingState() {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        list.innerHTML = `
            <div class="lb-loading">
                <div class="lb-spinner"></div>
                <p>순위를 불러오는 중...</p>
            </div>
        `;
    }

    renderErrorState(error) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;

        const isPermission = error && error.code === 'permission-denied';
        list.innerHTML = `
            <div class="lb-empty">
                <div class="lb-empty-icon">${isPermission ? '🔒' : '⚠️'}</div>
                <p class="lb-empty-title">${isPermission ? '로그인이 필요해요' : '데이터 로드 실패'}</p>
                <p class="lb-empty-desc">${isPermission ? '구글 로그인 후 리더보드를 확인하세요' : '잠시 후 다시 시도해주세요'}</p>
                ${!isPermission ? `<button class="lb-retry-btn" onclick="leaderboardManager.fetchLeaderboard(leaderboardManager.currentPeriod)">다시 시도</button>` : ''}
            </div>
        `;
    }

    showOfflineMessage() {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        list.innerHTML = `
            <div class="lb-empty">
                <div class="lb-empty-icon">🔌</div>
                <p class="lb-empty-title">오프라인 모드</p>
                <p class="lb-empty-desc">인터넷 연결이 필요합니다</p>
            </div>
        `;
    }

    renderLeaderboard(period) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;

        const currentUserUid = window.auth?.currentUser?.uid;

        if (this.leaderboardData.length === 0) {
            list.innerHTML = `
                <div class="lb-empty">
                    <div class="lb-empty-icon">🏆</div>
                    <p class="lb-empty-title">아직 참가자가 없어요</p>
                    <p class="lb-empty-desc">포모도로를 완료하면 자동으로 순위에 등록됩니다!</p>
                </div>
            `;
            return;
        }

        // 현재 유저 순위 찾기
        let myRank = null;
        let myData = null;
        this.leaderboardData.forEach((item, idx) => {
            if (item.uid === currentUserUid) {
                myRank = idx + 1;
                myData = item;
            }
        });

        // 내 순위 업데이트
        const myRankEl = document.getElementById('myRankValue');
        const myTimeEl = document.getElementById('myRankTime');
        const myStreakEl = document.getElementById('myRankStreak');
        const myRankNameEl = document.getElementById('myRankName');
        const myRankAvatarContainerEl = document.getElementById('myRankAvatarContainer');

        if (myRankEl) {
            if (!currentUserUid) {
                myRankEl.textContent = '-';
                if (myTimeEl) myTimeEl.textContent = '로그인 필요';
                if (myStreakEl) myStreakEl.textContent = '';
                if (myRankNameEl) myRankNameEl.textContent = '내 순위';
                if (myRankAvatarContainerEl) myRankAvatarContainerEl.innerHTML = '🎯';
            } else if (myData) {
                myRankEl.textContent = `#${myRank}`;
                if (myTimeEl) myTimeEl.textContent = this.formatTime(this.getFieldByPeriod(myData, period));
                if (myStreakEl) myStreakEl.textContent = myData.streak ? `🔥 ${myData.streak}일 연속` : '';

                if (myRankNameEl) myRankNameEl.textContent = myData.displayName || '내 순위';
                if (myRankAvatarContainerEl) {
                    if (myData.photoURL) {
                        myRankAvatarContainerEl.innerHTML = `<img src="${myData.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    } else {
                        const initial = (myData.displayName || '?').charAt(0).toUpperCase();
                        myRankAvatarContainerEl.innerHTML = `<div style="width: 100%; height: 100%; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">${initial}</div>`;
                    }
                }
            } else {
                // 50위 밖: 비동기 fetchMyRank 결과 기다리는 동안 '계산 중' 표시
                myRankEl.textContent = this.currentUserRank ? `#${this.currentUserRank}` : '계산 중...';
                if (myTimeEl) myTimeEl.textContent = '아직 기록 없음';
                if (myStreakEl) myStreakEl.textContent = '';

                if (myRankNameEl) myRankNameEl.textContent = window.auth?.currentUser?.displayName || '내 순위';
                if (myRankAvatarContainerEl && window.auth?.currentUser) {
                    if (window.auth.currentUser.photoURL) {
                        myRankAvatarContainerEl.innerHTML = `<img src="${window.auth.currentUser.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    } else {
                        const initial = (window.auth.currentUser.displayName || '?').charAt(0).toUpperCase();
                        myRankAvatarContainerEl.innerHTML = `<div style="width: 100%; height: 100%; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">${initial}</div>`;
                    }
                }
            }
        }

        // 리스트 렌더링
        list.innerHTML = this.leaderboardData.map((item, idx) => {
            const rank = idx + 1;
            const isMe = item.uid === currentUserUid;
            const medal = this.getMedalEmoji(rank);
            const rankStyle = this.getRankStyle(rank);
            const minutes = this.getFieldByPeriod(item, period);
            const initials = (item.displayName || '?').charAt(0).toUpperCase();

            return `
                <div class="lb-item ${rankStyle} ${isMe ? 'lb-item-me' : ''}">
                    <div class="lb-rank">
                        ${medal ? `<span class="lb-medal">${medal}</span>` : `<span class="lb-rank-num">${rank}</span>`}
                    </div>
                    <div class="lb-avatar">
                        ${item.photoURL
                    ? `<img src="${item.photoURL}" alt="${item.displayName}" class="lb-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ''
                }
                        <div class="lb-avatar-initials" style="${item.photoURL ? 'display:none' : ''}">${initials}</div>
                    </div>
                    <div class="lb-info">
                        <div class="lb-name">
                            ${item.displayName || '익명'}
                            ${isMe ? '<span class="lb-me-badge">나</span>' : ''}
                        </div>
                        <div class="lb-streak">${item.streak ? `🔥 ${item.streak}일` : ''}</div>
                    </div>
                    <div class="lb-time">${this.formatTime(minutes)}</div>
                </div>
            `;
        }).join('');
    }

    // 기간 전환
    switchPeriod(period) {
        this.currentPeriod = period;

        // 탭 버튼 업데이트
        document.querySelectorAll('.lb-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        this.fetchLeaderboard(period);
    }

    // 리더보드 뷰 진입 시
    async onEnterLeaderboard() {
        this.isLoading = true;
        this.renderLoadingState();

        // 데이터 불러오기를 즉시 실행하여 체감 속도 향상 (블로킹 방지)
        const fetchPromise = this.fetchLeaderboard(this.currentPeriod);

        // 로그인 상태면 자신의 데이터 백그라운드 업로드
        if (window.auth?.currentUser) {
            this.uploadUserStats().catch(console.error);
        }

        await fetchPromise;
    }
}

const leaderboardManager = new LeaderboardManager();
window.leaderboardManager = leaderboardManager;

// ==============================================
// Firebase Configuration and Authentication
// ==============================================

const firebaseConfig = {
    apiKey: "AIzaSyAn1qWE99a04gmFAYZjzJi4FNBs-mh_Vbg",
    authDomain: "pomodoro-7dd18.firebaseapp.com",
    projectId: "pomodoro-7dd18",
    storageBucket: "pomodoro-7dd18.firebasestorage.app",
    messagingSenderId: "934908066988",
    appId: "1:934908066988:web:cccaef99a882ca4c163309",
    measurementId: "G-68QV08GBVQ"
};

let app, auth, db;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        try {
            app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();

            window.auth = auth;
            window.db = db;

            console.log("Firebase initialized successfully");

            auth.onAuthStateChanged(async (user) => {
                const loginBtn = document.getElementById('googleLoginBtn');
                const userProfile = document.getElementById('userProfile');
                const userName = document.getElementById('userName');
                const userInitial = document.getElementById('userInitial');
                const userAvatar = document.getElementById('userAvatar');

                // Main Top Profile elements
                const mainTopProfile = document.getElementById('mainTopProfile');
                const mainTopName = document.getElementById('mainTopName');
                const mainTopInitial = document.getElementById('mainTopInitial');
                const mainTopAvatar = document.getElementById('mainTopAvatar');

                window.currentUser = user;

                if (user) {
                    console.log("User logged in:", user.displayName);
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (userProfile) {
                        userProfile.style.display = 'flex';
                        if (userName) userName.textContent = user.displayName;

                        // 아바타 혹은 이니셜 표시
                        if (user.photoURL && userAvatar) {
                            userAvatar.src = user.photoURL;
                            userAvatar.style.display = 'block';
                            if (userInitial) userInitial.style.display = 'none';
                        } else {
                            if (userAvatar) userAvatar.style.display = 'none';
                            if (userInitial) {
                                userInitial.style.display = 'flex';
                                if (user.displayName) {
                                    userInitial.textContent = user.displayName.charAt(0).toUpperCase();
                                }
                            }
                        }
                    }

                    // Main Top Profile Update
                    if (mainTopProfile) {
                        mainTopProfile.style.display = 'flex';
                        if (mainTopName) mainTopName.textContent = user.displayName;

                        if (user.photoURL && mainTopAvatar) {
                            mainTopAvatar.src = user.photoURL;
                            mainTopAvatar.style.display = 'block';
                            if (mainTopInitial) mainTopInitial.style.display = 'none';
                        } else {
                            if (mainTopAvatar) mainTopAvatar.style.display = 'none';
                            if (mainTopInitial) {
                                mainTopInitial.style.display = 'flex';
                                if (user.displayName) {
                                    mainTopInitial.textContent = user.displayName.charAt(0).toUpperCase();
                                }
                            }
                        }
                    }

                    showFirestoreLoading(true);
                    try {
                        await loadFromFirestore(user.uid);
                    } catch (e) {
                        console.warn('Firestore 로드 실패, 로컬 데이터 사용:', e);
                    } finally {
                        showFirestoreLoading(false);
                    }

                    const lbLoginBanner = document.getElementById('lbLoginBanner');
                    if (lbLoginBanner) lbLoginBanner.style.display = 'none';

                    if (window.leaderboardManager && document.getElementById('leaderboardView')?.classList.contains('active')) {
                        window.leaderboardManager.onEnterLeaderboard();
                    }
                } else {
                    window.currentUser = null;
                    console.log("User logged out");
                    if (loginBtn) loginBtn.style.display = 'flex';
                    if (userProfile) userProfile.style.display = 'none';
                    if (mainTopProfile) mainTopProfile.style.display = 'none';

                    const lbLoginBanner = document.getElementById('lbLoginBanner');
                    if (lbLoginBanner) lbLoginBanner.style.display = 'flex';

                    if (window.leaderboardManager && document.getElementById('leaderboardView')?.classList.contains('active')) {
                        window.leaderboardManager.onEnterLeaderboard();
                    }
                }
            });

        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    } else {
        console.error("Firebase library not loaded");
    }
}

function showFirestoreLoading(visible) {
    let overlay = document.getElementById('firestoreLoadingOverlay');
    if (!overlay && visible) {
        overlay = document.createElement('div');
        overlay.id = 'firestoreLoadingOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = '<div style="color:#fff;font-size:15px;background:rgba(255,255,255,0.1);padding:16px 24px;border-radius:12px;backdrop-filter:blur(8px);">☁️ 데이터 동기화 중...</div>';
        document.body.appendChild(overlay);
    } else if (overlay) {
        overlay.style.display = visible ? 'flex' : 'none';
    }
}

async function saveToFirestore(collectionName, data) {
    if (!auth || !auth.currentUser) return;

    const uid = auth.currentUser.uid;
    try {
        await db.collection('users').doc(uid).collection(collectionName).doc('data').set({
            items: data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Saved ${collectionName} to Firestore`);

        // 세션 저장 시 리더보드도 자동 업데이트
        if (collectionName === 'sessions' && window.leaderboardManager) {
            setTimeout(() => {
                window.leaderboardManager.uploadUserStats();
            }, 500);
        }

    } catch (error) {
        console.error(`Error saving ${collectionName}:`, error);
    }
}

async function loadFromFirestore(uid) {
    console.log("Loading data from Firestore...");

    const userRef = db.collection('users').doc(uid);
    const [todoDoc, settingsDoc, sessionDoc] = await Promise.all([
        userRef.collection('todos').doc('data').get().catch(() => null),
        userRef.collection('settings').doc('data').get().catch(() => null),
        userRef.collection('sessions').doc('data').get().catch(() => null),
    ]);

    if (todoDoc && todoDoc.exists) {
        const todos = todoDoc.data().items || [];
        localStorage.setItem('todos', JSON.stringify(todos));
        if (window.renderTodos) window.renderTodos();
        if (window.renderTasksList) window.renderTasksList();
        if (typeof updateGlobalTodos === 'function') updateGlobalTodos(todos);
        console.log("Loaded todos");
    }

    if (settingsDoc && settingsDoc.exists) {
        const settings = settingsDoc.data().items || {};
        localStorage.setItem('settings', JSON.stringify(settings));
        if (window.initSettings) window.initSettings();
        console.log("Loaded settings");
    }

    if (sessionDoc && sessionDoc.exists) {
        const sessions = sessionDoc.data().items || [];
        localStorage.setItem('focusSessions', JSON.stringify(sessions));
        if (window.statsManager) {
            window.statsManager.sessions = sessions;
            window.statsManager.updateStats();
        }
        console.log("Loaded sessions");
    }

    console.log("Data sync complete");
}

function googleLogin() {
    if (!auth) {
        console.error("Auth not initialized");
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("로그인 성공:", result.user.displayName);
        }).catch((error) => {
            console.error("로그인 실패:", error);
            if (error.code === 'auth/popup-blocked') {
                alert('팝업이 차단됐습니다. 브라우저 설정에서 팝업을 허용해주세요.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // 사용자가 직접 닫음, 무시
            } else {
                alert('로그인 실패: ' + error.message);
            }
        });
}

function googleLogout() {
    if (!auth) return;
    auth.signOut().then(() => {
        console.log('로그아웃 완료');
    });
}

window.saveToFirestore = saveToFirestore;
window.googleLogin = googleLogin;
window.googleLogout = googleLogout;
window.initFirebase = initFirebase;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

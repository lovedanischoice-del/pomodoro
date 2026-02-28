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
            console.log("Firebase initialized successfully");

            auth.onAuthStateChanged((user) => {
                const loginBtn = document.getElementById('googleLoginBtn');
                const userProfile = document.getElementById('userProfile');
                const userName = document.getElementById('userName');
                const userInitial = document.getElementById('userInitial');
                const userAvatar = document.getElementById('userAvatar');

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
                    loadFromFirestore(user.uid);
                } else {
                    window.currentUser = null;
                    console.log("User logged out");
                    if (loginBtn) loginBtn.style.display = 'flex';
                    if (userProfile) userProfile.style.display = 'none';
                }
            });

        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    } else {
        console.error("Firebase library not loaded");
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
    try {
        const todoDoc = await db.collection('users').doc(uid).collection('todos').doc('data').get();
        if (todoDoc.exists) {
            const data = todoDoc.data();
            const todos = data.items || [];
            localStorage.setItem('todos', JSON.stringify(todos));
            if (window.renderTodos) window.renderTodos();
            if (window.renderTasksList) window.renderTasksList();
            if (typeof updateGlobalTodos === 'function') updateGlobalTodos(todos);
            console.log("Loaded todos");
        }

        const settingsDoc = await db.collection('users').doc(uid).collection('settings').doc('data').get();
        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            const settings = data.items || {};
            localStorage.setItem('settings', JSON.stringify(settings));
            if (window.initSettings) window.initSettings();
            console.log("Loaded settings");
        }

        const sessionDoc = await db.collection('users').doc(uid).collection('sessions').doc('data').get();
        if (sessionDoc.exists) {
            const data = sessionDoc.data();
            const sessions = data.items || [];
            localStorage.setItem('focusSessions', JSON.stringify(sessions));
            if (window.statsManager) {
                window.statsManager.sessions = sessions;
                window.statsManager.updateStats();
            }
            console.log("Loaded sessions");
        }

        console.log("Data sync complete");

    } catch (error) {
        console.error("Error loading data:", error);
    }
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

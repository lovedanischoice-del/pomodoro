// body-double-firebase.js
// Handles Body Doubling logic connected to Firebase

let currentBodyDoubleSessionId = null;
let bodyDoubleUnsubscribe = null;

// The default global room for everyone to join for body doubling
const DEFAULT_SESSION_ID = "global-study-room";

// Dummy members to always show minimum 5 participants
const DUMMY_NAMES = ['집중하는 펭귄', '열공 메이트', '딥 워커', '뽀모 마스터', '조용한 스터디러'];
const DUMMY_STATUSES = ['focusing', 'focusing', 'break', 'waiting', 'focusing'];

/**
 * Make sure Firebase auth and db are ready
 */
function isFirebaseReady() {
    return window.db && window.auth && window.auth.currentUser;
}

/**
 * Get members padded with dummies to at least 5 total
 * Current user is always inserted at position 0
 */
function padWithDummies(realMembers = []) {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const isAnonymous = settings.anonymousMode === true;
    const user = window.auth?.currentUser;
    const myUid = user?.uid || 'local-user';

    let members = [...realMembers];

    // Make sure the current user is in the list (as first member)
    const alreadyHasMe = members.some(m => m.userId === myUid);
    if (!alreadyHasMe) {
        members.unshift({
            userId: myUid,
            name: user?.displayName || '나',
            avatarUrl: isAnonymous ? '' : (user?.photoURL || ''),
            isAnonymous: isAnonymous,
            status: (window.isRunning && window.currentMode)
                ? (window.currentMode === 'work' ? 'focusing' : 'break')
                : 'waiting',
        });
    }

    // Pad with dummies until we reach 5 total
    let dummyCount = 0;
    while (members.length < 5) {
        members.push({
            userId: `dummy-${dummyCount}`,
            name: DUMMY_NAMES[dummyCount % DUMMY_NAMES.length],
            avatarUrl: '',
            isAnonymous: true,
            status: DUMMY_STATUSES[dummyCount % DUMMY_STATUSES.length],
        });
        dummyCount++;
    }

    // Always keep current user first
    members.sort((a, b) => {
        if (a.userId === myUid) return -1;
        if (b.userId === myUid) return 1;
        return 0;
    });

    return members;
}

/**
 * Show the dummies immediately — always works, regardless of Firebase state
 */
function showDummiesNow() {
    if (typeof window.renderAvatarRow === 'function') {
        window.renderAvatarRow(padWithDummies([]));
    } else {
        console.warn('[Body Double] renderAvatarRow is not available yet');
    }
}

/**
 * Join or create the body double session
 */
async function joinBodyDoubleSession(sessionId = DEFAULT_SESSION_ID) {
    // Always show dummies immediately — user sees avatars right away
    currentBodyDoubleSessionId = sessionId;
    showDummiesNow();

    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const isAnonymous = settings.anonymousMode === true;
    const user = window.auth?.currentUser;

    // If Firebase is available, persist to server and start realtime listener
    if (isFirebaseReady()) {
        const currentStatus = (window.isRunning && window.currentMode)
            ? (window.currentMode === 'work' ? 'focusing' : 'break')
            : 'waiting';

        const memberData = {
            userId: user.uid,
            name: user.displayName || 'User',
            avatarUrl: user.photoURL || '',
            isAnonymous: isAnonymous,
            status: currentStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await window.db.collection('sessions')
                .doc(sessionId)
                .collection('members')
                .doc(user.uid)
                .set(memberData);
            console.log('[Body Double] Joined session:', sessionId);
        } catch (error) {
            console.error('[Body Double] Error joining session (dummies still visible):', error);
        }

        // Start listening for real updates (will override dummies if data exists)
        startRealtimeListener(sessionId);
    } else {
        console.warn('[Body Double] Firebase not ready — showing local dummies only.');
    }
}

/**
 * Start listening to the Firestore session for real-time member updates
 */
function startRealtimeListener(sessionId) {
    if (bodyDoubleUnsubscribe) {
        bodyDoubleUnsubscribe();
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const membersRef = window.db.collection('sessions').doc(sessionId).collection('members');

    bodyDoubleUnsubscribe = membersRef.onSnapshot((snapshot) => {
        let members = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.updatedAt) {
                const updatedTime = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date();
                if (updatedTime > twoHoursAgo) {
                    members.push(data);
                }
            } else {
                members.push(data);
            }
        });

        if (typeof window.renderAvatarRow === 'function') {
            window.renderAvatarRow(padWithDummies(members));
        }
    }, (error) => {
        console.error('[Body Double] Firestore snapshot error:', error);
        // On error, still show dummies
        showDummiesNow();
    });
}

/**
 * Update the user's status in the current session
 * status string: 'focusing', 'break', 'done', 'waiting'
 */
async function updateBodyDoubleStatus(status) {
    if (!currentBodyDoubleSessionId || !isFirebaseReady()) return;
    const user = window.auth.currentUser;
    try {
        await window.db.collection('sessions')
            .doc(currentBodyDoubleSessionId)
            .collection('members')
            .doc(user.uid)
            .update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('[Body Double] Error updating status:', error);
    }
}

/**
 * Leave the session
 */
async function leaveBodyDoubleSession() {
    if (bodyDoubleUnsubscribe) {
        bodyDoubleUnsubscribe();
        bodyDoubleUnsubscribe = null;
    }

    if (currentBodyDoubleSessionId && isFirebaseReady()) {
        const user = window.auth.currentUser;
        try {
            await window.db.collection('sessions')
                .doc(currentBodyDoubleSessionId)
                .collection('members')
                .doc(user.uid)
                .delete();
            console.log('[Body Double] Left session:', currentBodyDoubleSessionId);
        } catch (error) {
            console.error('[Body Double] Error leaving session:', error);
        }
    }

    currentBodyDoubleSessionId = null;

    if (typeof window.renderAvatarRow === 'function') {
        window.renderAvatarRow([]);
    }
}

// Attach to window
window.joinBodyDoubleSession = joinBodyDoubleSession;
window.updateBodyDoubleStatus = updateBodyDoubleStatus;
window.leaveBodyDoubleSession = leaveBodyDoubleSession;

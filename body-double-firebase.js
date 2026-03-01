// body-double-firebase.js
// Handles Body Doubling logic connected to Firebase

let currentBodyDoubleSessionId = null;
let bodyDoubleUnsubscribe = null;

// The default global room for everyone to join for body doubling
const DEFAULT_SESSION_ID = "global-study-room";

/**
 * Make sure Firebase auth and db are ready
 */
function isFirebaseReady() {
    return window.db && window.auth && window.auth.currentUser;
}

/**
 * Join or create the body double session
 */
async function joinBodyDoubleSession(sessionId = DEFAULT_SESSION_ID) {
    if (!isFirebaseReady()) {
        alert('바디더블에 참여하려면 먼저 구글 로그인이 필요합니다.');
        return;
    }

    const user = window.auth.currentUser;
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const isAnonymous = settings.anonymousMode === true;

    // Default status if timer isn't running
    // If we have a global isRunning and mode:
    let currentStatus = 'waiting';
    if (window.isRunning && window.currentMode) {
        currentStatus = window.currentMode === 'work' ? 'focusing' : 'break';
    }

    const memberData = {
        userId: user.uid,
        name: user.displayName || "User",
        avatarUrl: user.photoURL || "",
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

        currentBodyDoubleSessionId = sessionId;
        console.log(`Joined Body Double Session: ${sessionId}`);

        // Start listening to members
        listenToSessionMembers(sessionId);
    } catch (error) {
        console.error("Error joining body double session:", error);
    }
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
        console.error("Error updating body double status:", error);
    }
}

/**
 * Listen for changes in the active session
 */
function listenToSessionMembers(sessionId) {
    if (!isFirebaseReady()) return;

    if (bodyDoubleUnsubscribe) {
        bodyDoubleUnsubscribe(); // Stop any previous listeners
    }

    const membersRef = window.db.collection('sessions').doc(sessionId).collection('members');

    // Let's filter out very old updates (e.g. older than 2 hours) to show only active members
    // For simplicity right now, we just fetch all or we can just fetch recent.
    // For now we just get everyone and filter on client side.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    bodyDoubleUnsubscribe = membersRef.onSnapshot((snapshot) => {
        let members = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Filter out stale users (e.g., haven't updated status in 2 hours)
            if (data.updatedAt) {
                const updatedTime = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date();
                if (updatedTime > twoHoursAgo) {
                    members.push(data);
                }
            } else {
                members.push(data); // If just created
            }
        });

        // Filter out current user from the visual list if you only want to see *others*
        // Or keep current user in the list? Usually seeing yourself is good feedback.
        // If keeping, you can sort so current user is first.
        const myUid = window.auth.currentUser.uid;

        // Sort: me first, then by recent updates
        members.sort((a, b) => {
            if (a.userId === myUid) return -1;
            if (b.userId === myUid) return 1;

            const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
            const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
            return timeB - timeA;
        });

        if (window.renderAvatarRow) {
            window.renderAvatarRow(members);
        }
    });
}

/**
 * Leave the session
 */
async function leaveBodyDoubleSession() {
    if (!currentBodyDoubleSessionId || !isFirebaseReady()) return;

    const user = window.auth.currentUser;
    const sessionId = currentBodyDoubleSessionId;

    try {
        await window.db.collection('sessions')
            .doc(sessionId)
            .collection('members')
            .doc(user.uid)
            .delete();

        console.log(`Left Body Double Session: ${sessionId}`);
    } catch (error) {
        console.error("Error leaving body double session:", error);
    }

    if (bodyDoubleUnsubscribe) {
        bodyDoubleUnsubscribe();
        bodyDoubleUnsubscribe = null;
    }

    currentBodyDoubleSessionId = null;

    if (window.renderAvatarRow) {
        window.renderAvatarRow([]); // clear avatars
    }
}

// Attach to window
window.joinBodyDoubleSession = joinBodyDoubleSession;
window.updateBodyDoubleStatus = updateBodyDoubleStatus;
window.leaveBodyDoubleSession = leaveBodyDoubleSession;

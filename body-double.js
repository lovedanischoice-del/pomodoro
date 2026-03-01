// body-double.js - Body Doubling feature logic

const PENGUIN_IMG = "assets/penguin.png"; // Fallback/anonymous image path
const MAX_VISIBLE_AVATARS = 4;

const OVERLAY_CONFIG = {
    focusing: { bg: "transparent", icon: "" },
    work: { bg: "transparent", icon: "" },
    break: { bg: "rgba(100,149,237,0.45)", icon: "⏸" },
    done: { bg: "rgba(72,199,142,0.45)", icon: "✓" },
    waiting: { bg: "rgba(150,150,150,0.35)", icon: "…" },
};

/**
 * Initializes the Body Double container in the DOM if it doesn't exist
 */
function ensureBodyDoubleContainer() {
    let container = document.getElementById('bodyDoubleContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'bodyDoubleContainer';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Renders the body double avatars given a list of members
 * @param {Array} members - Array of member objects: { userId, avatarUrl, status, isAnonymous }
 */
function renderAvatarRow(members = []) {
    const container = ensureBodyDoubleContainer();
    container.innerHTML = ''; // Clear current

    if (members.length === 0) return;

    const row = document.createElement('div');
    row.className = 'avatar-row';

    const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = members.length - MAX_VISIBLE_AVATARS;

    // Render visible avatars
    visibleMembers.forEach(member => {
        row.appendChild(createAvatarItem(member));
    });

    // Render overflow badge if needed
    if (overflowCount > 0) {
        const overflowMembers = members.slice(MAX_VISIBLE_AVATARS);
        row.appendChild(createOverflowBadge(overflowCount, overflowMembers));
    }

    container.appendChild(row);
}

/**
 * Creates a single avatar DOM element
 */
function createAvatarItem(member) {
    const avatarItem = document.createElement('div');
    avatarItem.className = 'avatar-item';
    avatarItem.title = member.isAnonymous ? "Anonymous Penguin" : member.name || "User";

    const img = document.createElement('img');
    img.className = 'avatar-img';
    // Use penguin if anonymous or missing url
    img.src = member.isAnonymous ? PENGUIN_IMG : (member.avatarUrl || PENGUIN_IMG);
    img.onerror = () => { img.src = PENGUIN_IMG; }; // fallback

    avatarItem.appendChild(img);

    // Status overlay
    const status = member.status ? member.status.toLowerCase() : 'waiting';
    const config = OVERLAY_CONFIG[status] || OVERLAY_CONFIG['waiting'];

    if (config.bg !== 'transparent' || config.icon) {
        const overlay = document.createElement('div');
        overlay.className = `status-overlay ${status}`;
        overlay.style.background = config.bg;
        overlay.textContent = config.icon || '';
        avatarItem.appendChild(overlay);
    }

    return avatarItem;
}

/**
 * Creates the +N overflow badge and attached dropdown
 */
function createOverflowBadge(count, overflowMembers) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const badge = document.createElement('div');
    badge.className = 'overflow-badge';
    badge.textContent = `+${count}`;

    const dropdown = document.createElement('div');
    dropdown.className = 'avatar-dropdown';

    // Populate dropdown
    overflowMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'avatar-dropdown-item';

        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'dropdown-avatar';

        const img = document.createElement('img');
        img.className = 'dropdown-avatar-img';
        img.src = member.isAnonymous ? PENGUIN_IMG : (member.avatarUrl || PENGUIN_IMG);
        img.onerror = () => { img.src = PENGUIN_IMG; };

        avatarWrapper.appendChild(img);

        const status = member.status ? member.status.toLowerCase() : 'waiting';
        const config = OVERLAY_CONFIG[status] || OVERLAY_CONFIG['waiting'];
        if (config.bg !== 'transparent' || config.icon) {
            const overlay = document.createElement('div');
            overlay.className = `status-overlay ${status}`;
            overlay.style.background = config.bg;
            overlay.textContent = config.icon || '';
            avatarWrapper.appendChild(overlay);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = member.isAnonymous ? "Anonymous" : (member.name || `User ${member.userId.substring(0, 4)}`);

        item.appendChild(avatarWrapper);
        item.appendChild(nameSpan);
        dropdown.appendChild(item);
    });

    // Toggle dropdown on click
    badge.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    wrapper.appendChild(badge);
    wrapper.appendChild(dropdown);

    return wrapper;
}

// Ensure the functions are available globally
window.renderAvatarRow = renderAvatarRow;

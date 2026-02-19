// ==============================================
// Tasks and Settings Management
// ==============================================

// Tasks View Logic
function initTasks() {
    const todoInputTasks = document.getElementById('todoInputTasks');
    const addTodoBtnTasks = document.getElementById('addTodoBtnTasks');
    const todoListTasks = document.getElementById('todoListTasks');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompleted = document.getElementById('clearCompleted');
    const taskCount = document.getElementById('taskCount');

    let currentFilter = 'all';

    function getTodos() {
        return JSON.parse(localStorage.getItem('todos') || '[]');
    }

    function saveTodosLocal(todosArray) {
        localStorage.setItem('todos', JSON.stringify(todosArray));
        if (window.saveToFirestore) {
            window.saveToFirestore('todos', todosArray);
        }
    }

    function addTaskFromTasksView() {
        const text = todoInputTasks?.value.trim();
        if (text) {
            const todos = getTodos();
            todos.push({ id: Date.now(), text, completed: false });
            saveTodosLocal(todos);
            renderTasksList();
            if (todoInputTasks) todoInputTasks.value = '';
        }
    }

    function renderTasksList() {
        if (!todoListTasks) return;

        const todos = getTodos();
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        todoListTasks.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="window.toggleTodoFromTasks(${todo.id})">
                <span class="todo-text">${todo.text}</span>
                <button class="delete-todo" onclick="window.deleteTodoFromTasks(${todo.id})">✕</button>
            </li>
        `).join('');

        updateTaskCount();
    }

    function updateTaskCount() {
        if (!taskCount) return;
        const todos = getTodos();
        const activeCount = todos.filter(t => !t.completed).length;
        taskCount.textContent = `${activeCount} tasks`;
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTasksList();
            });
        });
    }

    if (clearCompleted) {
        clearCompleted.addEventListener('click', () => {
            let todos = getTodos();
            todos = todos.filter(t => !t.completed);
            saveTodosLocal(todos);
            renderTasksList();
        });
    }

    if (addTodoBtnTasks) {
        addTodoBtnTasks.addEventListener('click', addTaskFromTasksView);
    }

    if (todoInputTasks) {
        todoInputTasks.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTaskFromTasksView();
            }
        });
    }

    window.renderTasksList = renderTasksList;

    window.toggleTodoFromTasks = function (id) {
        let todos = getTodos();
        todos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodosLocal(todos);
        renderTasksList();
    };

    window.deleteTodoFromTasks = function (id) {
        let todos = getTodos();
        todos = todos.filter(todo => todo.id !== id);
        saveTodosLocal(todos);
        renderTasksList();
    };
}

// Settings View Logic
function initSettings() {
    const workDuration = document.getElementById('workDuration');
    const restDuration = document.getElementById('restDuration');
    const autoStart = document.getElementById('autoStart');
    const soundEnabled = document.getElementById('soundEnabled');
    const volumeSettings = document.getElementById('volumeSettings');
    const volumeValue = document.getElementById('volumeValue');
    const notificationSound = document.getElementById('notificationSound');
    const exportData = document.getElementById('exportData');
    const bgmBtn = document.getElementById('bgmBtn');
    const bellBtn = document.getElementById('bellBtn');
    const bgmSelect = null; // Removed
    const bellSelect = null; // Removed

    // Modal Elements
    const soundModal = document.getElementById('soundModal');
    const soundList = document.getElementById('soundList');
    const soundModalTitle = document.getElementById('soundModalTitle');
    const closeSoundModal = document.getElementById('closeSoundModal');

    let currentModalType = ''; // 'bgm' or 'bell'

    function openSoundModal(type) {
        if (!soundModal) return;
        currentModalType = type;
        soundModal.classList.add('show');
        soundModalTitle.textContent = type === 'bgm' ? 'Select Background Music' : 'Select Notification Sound';
        renderSoundList(type);
    }

    function closeSoundModalFunc() {
        if (soundModal) soundModal.classList.remove('show');
        currentModalType = '';
    }

    if (closeSoundModal) {
        closeSoundModal.addEventListener('click', closeSoundModalFunc);
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === soundModal) {
            closeSoundModalFunc();
        }
    });

    function renderSoundList(type) {
        if (!soundList || !window.SOUND_CONFIG) return;

        const sounds = type === 'bgm' ? window.SOUND_CONFIG.bgm : window.SOUND_CONFIG.bells;
        const currentSettingId = getCurrentSoundId(type);

        soundList.innerHTML = '';

        sounds.forEach(sound => {
            const div = document.createElement('div');
            div.className = `sound-option ${sound.id === currentSettingId ? 'selected' : ''}`;
            div.textContent = sound.name;
            div.dataset.id = sound.id;

            div.addEventListener('click', () => {
                selectSound(type, sound.id);
                // Visual feedback
                document.querySelectorAll('.sound-option').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');

                // Optional: Play sample on selection (short preview if it's bell)
                if (type === 'bell') {
                    playTestSound(sound.file);
                } else if (type === 'bgm') {
                    // For BGM, maybe just save. Preview button on main screen handles preview.
                }

                // Close modal after short delay or immediately?
                // User asked "save on selection?". Keep it open so they can try others, or close?
                // Standard mobile behavior: select and close.
                setTimeout(closeSoundModalFunc, 200);
            });

            soundList.appendChild(div);
        });
    }

    function getCurrentSoundId(type) {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        if (type === 'bgm') return settings.bgmId || 'fire';
        return settings.bellId || 'chime';
    }

    function selectSound(type, id) {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        if (type === 'bgm') {
            settings.bgmId = id;
            updateSoundButtonText('bgm', id);
            // Update playing BGM immediately if enabled
            updateAudioSource('fireSound', id);
            const fireSound = document.getElementById('fireSound');
            // Check if timer is running and sound is enabled (assuming `isRunning` is a global variable from main.js)
            if (fireSound && settings.soundEnabled && window.isRunning) {
                // If timer running and sound enabled, switch track
                fireSound.play().catch(e => console.log(e));
            }
        } else {
            settings.bellId = id;
            updateSoundButtonText('bell', id);
        }

        localStorage.setItem('settings', JSON.stringify(settings));
        if (window.saveToFirestore) {
            window.saveToFirestore('settings', settings);
        }
    }

    function updateSoundButtonText(type, id) {
        const btn = type === 'bgm' ? bgmBtn : bellBtn;
        if (!btn || !window.SOUND_CONFIG) return;

        const list = type === 'bgm' ? window.SOUND_CONFIG.bgm : window.SOUND_CONFIG.bells;
        const sound = list.find(s => s.id === id) || list[0];
        if (sound) {
            // Use innerHTML to include span for styling/truncation
            btn.innerHTML = `<span>${sound.name}</span>`;
        }
    }

    function playTestSound(file) {
        const audio = new Audio(file);
        audio.volume = 0.5;
        audio.play().catch(e => console.error(e));
    }


    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');

        if (workDuration) workDuration.value = settings.workDuration || 20;
        if (restDuration) restDuration.value = settings.restDuration || 5;
        if (autoStart) autoStart.checked = settings.autoStart !== false;
        if (soundEnabled) soundEnabled.checked = settings.soundEnabled !== false;

        // Load initial button texts
        updateSoundButtonText('bgm', settings.bgmId || 'fire');
        updateSoundButtonText('bell', settings.bellId || 'chime');

        if (volumeSettings) {
            volumeSettings.value = settings.volume || 0.5;
            updateVolumeDisplay(settings.volume || 0.5);
        }
        if (notificationSound) notificationSound.checked = settings.notificationSound !== false;

        // Update audio sources based on loaded settings
        updateAudioSource('fireSound', settings.bgmId);
        // We'll update chime source when it's played, or globally if possible
    }

    function saveSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        // Update other fields
        settings.workDuration = parseInt(workDuration?.value || 20);
        settings.restDuration = parseInt(restDuration?.value || 5);
        settings.autoStart = autoStart?.checked !== false;
        settings.soundEnabled = soundEnabled?.checked !== false;
        settings.volume = parseFloat(volumeSettings?.value || 0.5);
        settings.notificationSound = notificationSound?.checked !== false;

        localStorage.setItem('settings', JSON.stringify(settings));
        applyTimerSettings(settings);
        if (window.saveToFirestore) {
            window.saveToFirestore('settings', settings);
        }
    }

    function updateAudioSource(elementId, soundId) {
        if (!window.SOUND_CONFIG) return;

        let soundUrl = '';
        if (elementId === 'fireSound') { // BGM
            const sound = window.SOUND_CONFIG.bgm.find(s => s.id === soundId) || window.SOUND_CONFIG.bgm[0];
            if (sound) soundUrl = sound.file;
        }

        const audioElement = document.getElementById(elementId);
        if (audioElement && soundUrl) {
            // Only update if source changed
            const currentSrc = audioElement.querySelector('source')?.src;
            if (!currentSrc || !currentSrc.includes(soundUrl)) {
                audioElement.innerHTML = `<source src="${soundUrl}?v=${Date.now()}" type="audio/mpeg">`;
                audioElement.load(); // Reload audio element
            }
        }
    }

    function applyTimerSettings(settings) {
        const fireSound = document.getElementById('fireSound');
        const volumeSlider = document.getElementById('volumeSlider');
        if (fireSound) fireSound.volume = settings.volume;
        if (volumeSlider) volumeSlider.value = settings.volume;

        updateAudioSource('fireSound', settings.bgmId);
    }

    function updateVolumeDisplay(value) {
        if (volumeValue) {
            volumeValue.textContent = Math.round(value * 100) + '%';
        }
    }

    function playTestNotificationSound() {
        const bellId = bellSelect?.value || 'chime';
        const soundConfig = window.SOUND_CONFIG?.bells.find(s => s.id === bellId) || window.SOUND_CONFIG?.bells[0];
        const soundFile = soundConfig ? soundConfig.file : 'sounds/bells/chime.mp3';

        // Fallback or custom play
        try {
            const chimeSound = new Audio(soundFile);
            chimeSound.volume = 0.7;
            chimeSound.play()
                .then(() => {
                    console.log(`Test notification sound played (${soundFile})`);
                })
                .catch(error => {
                    console.error('Test sound playback failed:', error);
                    if (window.playFallbackChime) window.playFallbackChime();
                });
        } catch (error) {
            console.error('Test sound error:', error);
            if (window.playFallbackChime) window.playFallbackChime();
        }
    }

    if (workDuration) workDuration.addEventListener('change', saveSettings);
    if (restDuration) restDuration.addEventListener('change', saveSettings);
    if (autoStart) autoStart.addEventListener('change', saveSettings);

    if (bgmBtn) {
        bgmBtn.addEventListener('click', () => openSoundModal('bgm'));
    }
    if (bellBtn) {
        bellBtn.addEventListener('click', () => openSoundModal('bell'));
    }

    if (bgmSelect) bgmSelect.addEventListener('change', () => {
        saveSettings();
        // If sound is enabled and running, the new sound should start playing?
        // For now, handleSound in main.js will resume/pause.
        // If we change source while playing, we might need to restart play.
        const fireSound = document.getElementById('fireSound');
        if (fireSound && !fireSound.paused) {
            fireSound.play().catch(e => console.log('Resume failed:', e));
        }
    });

    if (bellSelect) bellSelect.addEventListener('change', () => {
        saveSettings();
        // Preview is now manual via button, so removed auto-play
    });

    // Preview Logic
    let currentPreviewAudio = null;
    let isPreviewingBgm = false;

    const previewBgmBtn = document.getElementById('previewBgm');
    const previewBellBtn = document.getElementById('previewBell');

    if (previewBgmBtn) {
        previewBgmBtn.addEventListener('click', () => {
            if (isPreviewingBgm && currentPreviewAudio) {
                // Stop Preview
                currentPreviewAudio.pause();
                currentPreviewAudio = null;
                isPreviewingBgm = false;
                previewBgmBtn.textContent = '▶';
                previewBgmBtn.classList.remove('playing');
            } else {
                // Start Preview
                if (currentPreviewAudio) {
                    currentPreviewAudio.pause(); // Stop any other preview
                    if (previewBellBtn) previewBellBtn.classList.remove('playing');
                }

                // const bgmId = bgmSelect?.value || 'fire';
                const settings = JSON.parse(localStorage.getItem('settings') || '{}');
                const bgmId = settings.bgmId || 'fire';
                const sound = window.SOUND_CONFIG?.bgm.find(s => s.id === bgmId);
                if (sound) {
                    currentPreviewAudio = new Audio(sound.file);
                    currentPreviewAudio.loop = true;
                    currentPreviewAudio.volume = volumeSettings?.value || 0.5;
                    currentPreviewAudio.play().catch(e => console.error('Preview failed:', e));

                    isPreviewingBgm = true;
                    previewBgmBtn.textContent = '■';
                    previewBgmBtn.classList.add('playing');

                    // Reset when ended (though loop is true, just in case)
                    currentPreviewAudio.onended = () => {
                        isPreviewingBgm = false;
                        previewBgmBtn.textContent = '▶';
                        previewBgmBtn.classList.remove('playing');
                    };
                }
            }
        });
    }

    if (previewBellBtn) {
        previewBellBtn.addEventListener('click', () => {
            if (currentPreviewAudio && isPreviewingBgm) {
                // Stop BGM preview if running
                currentPreviewAudio.pause();
                isPreviewingBgm = false;
                if (previewBgmBtn) {
                    previewBgmBtn.textContent = '▶';
                    previewBgmBtn.classList.remove('playing');
                }
            }

            // Play Bell
            // const bellId = bellSelect?.value || 'chime';
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            const bellId = settings.bellId || 'chime';
            const sound = window.SOUND_CONFIG?.bells.find(s => s.id === bellId);
            if (sound) {
                const bellAudio = new Audio(sound.file);
                bellAudio.volume = volumeSettings?.value || 0.5;
                bellAudio.play().catch(e => console.error('Bell preview failed:', e));

                previewBellBtn.classList.add('playing');
                setTimeout(() => previewBellBtn.classList.remove('playing'), 1000);
            }
        });
    }

    if (soundEnabled) {
        soundEnabled.addEventListener('change', (e) => {
            saveSettings();
            // Let main.js handle the audio playback state update
            if (typeof window.handleSound === 'function') {
                window.handleSound();
            }
        });
    }

    if (volumeSettings) {
        volumeSettings.addEventListener('input', (e) => {
            updateVolumeDisplay(e.target.value);
            saveSettings();
        });
    }

    if (notificationSound) {
        notificationSound.addEventListener('change', (e) => {
            saveSettings();
            // Note: removed automatic test play on toggle to avoid annoyance, 
            // but user can use sound selector change to test.
        });
    }

    if (exportData) {
        exportData.addEventListener('click', () => {
            const data = {
                todos: JSON.parse(localStorage.getItem('todos') || '[]'),
                sessions: JSON.parse(localStorage.getItem('focusSessions') || '[]'),
                settings: JSON.parse(localStorage.getItem('settings') || '{}')
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bbangmodoro-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            alert('Data exported successfully!');
        });
    }

    if (importData) {
        importData.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.todos) localStorage.setItem('todos', JSON.stringify(data.todos));
                        if (data.sessions) localStorage.setItem('focusSessions', JSON.stringify(data.sessions));
                        if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));

                        alert('Data imported successfully! Page will reload.');
                        location.reload();
                    } catch (error) {
                        alert('Import failed: Invalid file format.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }

    if (clearAllData) {
        clearAllData.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                localStorage.removeItem('todos');
                localStorage.removeItem('focusSessions');
                localStorage.removeItem('settings');
                localStorage.removeItem('hasSeenOnboarding');
                alert('All data deleted. Page will reload.');
                location.reload();
            }
        });
    }

    loadSettings();
}

// Initialize on DOM load
// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Always initialize settings and tasks, regardless of app visibility
    setTimeout(() => {
        initTasks();
        initSettings();
        updateBuildTimestamp();
    }, 100);
});

// Initialize when startApp is called
if (window.startApp) {
    const originalStartApp = window.startApp;
    window.startApp = function () {
        originalStartApp();
        setTimeout(() => {
            initTasks();
            initSettings();
            updateBuildTimestamp();
        }, 700);
    };
}

// Update build timestamp - Global function
function updateBuildTimestamp() {
    const timestampEl = document.getElementById('buildTimestamp');
    if (timestampEl) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        timestampEl.textContent = `Updated: ${year}. ${month}. ${day} ${hours}:${minutes}`;
        console.log('Build timestamp updated:', timestampEl.textContent);
    } else {
        console.warn('buildTimestamp element not found');
    }
}

// Try to update timestamp immediately when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBuildTimestamp);
} else {
    // DOM already loaded
    updateBuildTimestamp();
}

// Also update when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(updateBuildTimestamp, 100);
    }
});

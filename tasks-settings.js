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
    const importData = document.getElementById('importData');
    const clearAllData = document.getElementById('clearAllData');

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');

        if (workDuration) workDuration.value = settings.workDuration || 20;
        if (restDuration) restDuration.value = settings.restDuration || 5;
        if (autoStart) autoStart.checked = settings.autoStart !== false;
        if (soundEnabled) soundEnabled.checked = settings.soundEnabled !== false;
        if (volumeSettings) {
            volumeSettings.value = settings.volume || 0.5;
            updateVolumeDisplay(settings.volume || 0.5);
        }
        if (notificationSound) notificationSound.checked = settings.notificationSound !== false;
    }

    function saveSettings() {
        const settings = {
            workDuration: parseInt(workDuration?.value || 20),
            restDuration: parseInt(restDuration?.value || 5),
            autoStart: autoStart?.checked !== false,
            soundEnabled: soundEnabled?.checked !== false,
            volume: parseFloat(volumeSettings?.value || 0.5),
            notificationSound: notificationSound?.checked !== false
        };
        localStorage.setItem('settings', JSON.stringify(settings));
        applyTimerSettings(settings);
        if (window.saveToFirestore) {
            window.saveToFirestore('settings', settings);
        }
    }

    function applyTimerSettings(settings) {
        const fireSound = document.getElementById('fireSound');
        const volumeSlider = document.getElementById('volumeSlider');
        if (fireSound) fireSound.volume = settings.volume;
        if (volumeSlider) volumeSlider.value = settings.volume;
    }

    function updateVolumeDisplay(value) {
        if (volumeValue) {
            volumeValue.textContent = Math.round(value * 100) + '%';
        }
    }

    function playTestNotificationSound() {
        if (window.playChimeBell) {
            window.playChimeBell();
        } else {
            // Fallback if window.playChimeBell is not available
            try {
                const chimeSound = new Audio('./chime.mp3');
                chimeSound.volume = 0.7;
                chimeSound.play()
                    .then(() => {
                        console.log('Test notification sound played (fallback)');
                    })
                    .catch(error => {
                        console.error('Test sound playback failed (fallback):', error);
                        // Try synthesis fallback
                        if (window.playFallbackChime) {
                            window.playFallbackChime();
                        }
                    });
            } catch (error) {
                console.error('Test sound error:', error);
                if (window.playFallbackChime) {
                    window.playFallbackChime();
                }
            }
        }
    }

    if (workDuration) workDuration.addEventListener('change', saveSettings);
    if (restDuration) restDuration.addEventListener('change', saveSettings);
    if (autoStart) autoStart.addEventListener('change', saveSettings);

    // Add event listener for the test button
    const testChimeBellBtn = document.getElementById('testChimeBell');
    if (testChimeBellBtn) {
        testChimeBellBtn.addEventListener('click', () => {
            console.log('Test chime bell button clicked');
            playTestNotificationSound();
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
            if (e.target.checked) {
                playTestNotificationSound();
            }
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
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app && !app.classList.contains('app-hidden')) {
        setTimeout(() => {
            initTasks();
            initSettings();
            updateBuildTimestamp();
        }, 100);
    }
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

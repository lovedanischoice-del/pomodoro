// ==============================================
// Pomodoro Timer Main Logic
// ==============================================

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Onboarding Logic
function startApp() {
    const onboarding = document.getElementById('onboarding');
    const app = document.getElementById('app');

    if (onboarding) onboarding.classList.add('hide');

    setTimeout(() => {
        if (onboarding) onboarding.style.display = 'none';
        if (app) app.classList.remove('app-hidden');
        localStorage.setItem('hasSeenOnboarding', 'true');
        init();
    }, 500);
}

window.addEventListener('DOMContentLoaded', () => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const onboarding = document.getElementById('onboarding');
    const app = document.getElementById('app');

    if (hasSeenOnboarding === 'true') {
        if (onboarding) onboarding.style.display = 'none';
        if (app) app.classList.remove('app-hidden');
        init();

        // Initialize navigation after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof initNavigation === 'function') {
                initNavigation();
            }
        }, 100);
    }
});

window.startApp = startApp;

// DOM Elements
const timeMain = document.getElementById('timeMain');
const timeSub = document.getElementById('timeSub');
const statusBadge = document.getElementById('statusBadge');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');
const resetBtn = document.getElementById('resetBtn');
const timerProgress = document.querySelector('.timer-progress');
const fireSound = document.getElementById('fireSound');
const soundStatus = document.getElementById('soundStatus');
const volumeSlider = document.getElementById('volumeSlider');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

// Chime Bell Sound Function
function playChimeBell() {
    try {
        // Get selected chime from settings
        let soundFile = 'sounds/bells/chime.mp3'; // new default path

        if (window.SOUND_CONFIG) {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            const bellId = settings.bellId || 'chime';
            const sound = window.SOUND_CONFIG.bells.find(s => s.id === bellId);
            if (sound) soundFile = sound.file;
        }

        const chimeSound = new Audio(soundFile);
        chimeSound.volume = 0.7;
        chimeSound.play()
            .then(() => {
                console.log(`Chime bell played successfully (${soundFile})`);
            })
            .catch(error => {
                console.error('Chime bell playback failed:', error);
                console.error('Trying alternative chime sound...');
                // Fallback to synthesized sound
                playFallbackChime();
            });
    } catch (error) {
        console.error('Chime bell error:', error);
        playFallbackChime();
    }
}

function playFallbackChime() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);

        console.log('Fallback chime played');
    } catch (error) {
        console.error('Fallback chime failed:', error);
    }
}

window.playChimeBell = playChimeBell;
window.playFallbackChime = playFallbackChime;

// Constants
const WORK_TIME = 20 * 60;
const REST_TIME = 5 * 60;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 45;

// State Variables
var timeLeft = WORK_TIME;
var isRunning = false;
var isWorkMode = true;
var timerId = null;
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initialization
function init() {
    updateDisplay();
    updateProgress(0);
    renderTodos();
    if (fireSound && volumeSlider) {
        fireSound.volume = volumeSlider.value;
    }
}

// Timer Logic
function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        const totalTime = isWorkMode ? WORK_TIME : REST_TIME;
        const progress = (totalTime - timeLeft) / totalTime;
        updateProgress(progress);

        // Update background rotation based on progress (0-360 degrees)
        const rotation = progress * 360;
        document.documentElement.style.setProperty('--bg-rotation', `${rotation}deg`);
    } else {
        switchMode();
    }
}

function switchMode() {
    const completedDuration = isWorkMode ? WORK_TIME / 60 : REST_TIME / 60;
    const sessionType = isWorkMode ? 'work' : 'rest';

    if (typeof statsManager !== 'undefined') {
        statsManager.addSession(completedDuration, sessionType);
    }

    playChimeBell();

    isWorkMode = !isWorkMode;
    timeLeft = isWorkMode ? WORK_TIME : REST_TIME;

    // Update body classes for background animation
    if (isRunning) {
        if (isWorkMode) {
            document.body.classList.add('timer-running');
            document.body.classList.remove('timer-rest');
        } else {
            document.body.classList.add('timer-rest');
            document.body.classList.remove('timer-running');
        }
    }

    if (statusBadge) {
        statusBadge.textContent = isWorkMode ? 'WORK' : 'REST';
        statusBadge.style.background = isWorkMode ? 'var(--accent-work)' : 'var(--accent-rest)';
        statusBadge.style.boxShadow = isWorkMode ? '0 0 20px rgba(255, 107, 107, 0.4)' : '0 0 20px rgba(78, 205, 196, 0.4)';
    }
    if (timeSub) {
        timeSub.textContent = isWorkMode ? 'WORK SESSION' : 'REST BREAK';
    }
    if (timerProgress) {
        if (isWorkMode) {
            timerProgress.style.stroke = 'url(#gradient)';
        } else {
            timerProgress.style.stroke = '#4ecdc4';
        }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Bbangmodoro', {
            body: isWorkMode ? 'Work time!' : 'Rest time!',
            icon: 'icon-192.png'
        });
    }

    handleSound();
    updateDisplay();
    updateProgress(0);

    if (isRunning) {
        console.log(isWorkMode ? 'Work session started!' : 'Rest session started!');
    }
}

function handleSound() {
    if (!fireSound) {
        console.warn('fireSound element not found');
        return;
    }

    // Check if sound is enabled in settings
    const soundEnabled = document.getElementById('soundEnabled')?.checked ?? true;

    if (isRunning && isWorkMode && soundEnabled) {
        // Attempt to play sound
        const playPromise = fireSound.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Playback started successfully
                if (soundStatus) soundStatus.classList.add('visible');
            })
                .catch(error => {
                    console.error('Audio playback failed:', error);

                    // Common error: user hasn't interacted with document yet
                    if (error.name === 'NotAllowedError') {
                        console.log('User interaction required for audio playback.');
                    }

                    if (soundStatus) soundStatus.classList.remove('visible');
                });
        }
    } else {
        fireSound.pause();
        if (soundStatus) soundStatus.classList.remove('visible');
    }
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        if (toggleText) toggleText.textContent = 'START';
        isRunning = false;
        document.body.classList.remove('timer-running', 'timer-rest');
        handleSound();
    } else {
        timerId = setInterval(tick, 1000);
        if (toggleText) toggleText.textContent = 'PAUSE';
        isRunning = true;
        if (isWorkMode) {
            document.body.classList.add('timer-running');
            document.body.classList.remove('timer-rest');
        } else {
            document.body.classList.add('timer-rest');
            document.body.classList.remove('timer-running');
        }
        handleSound();
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = true;
    timeLeft = WORK_TIME;

    // Reset background
    document.body.classList.remove('timer-running', 'timer-rest');
    document.documentElement.style.setProperty('--bg-rotation', '0deg');

    if (toggleText) toggleText.textContent = 'START';
    if (statusBadge) {
        statusBadge.textContent = 'WORK';
        statusBadge.style.background = 'var(--accent-work)';
    }
    if (timeSub) timeSub.textContent = 'WORK SESSION';
    if (timerProgress) timerProgress.style.stroke = 'url(#gradient)';

    handleSound();
    updateDisplay();
    updateProgress(0);
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeMain) timeMain.textContent = timeString;
    document.title = `${timeString} - Bbangmodoro`;
}

function updateProgress(progress) {
    if (!timerProgress) return;
    const offset = CIRCLE_CIRCUMFERENCE - (progress * CIRCLE_CIRCUMFERENCE);
    timerProgress.style.strokeDashoffset = offset;
}

// Event Listeners
if (toggleBtn) toggleBtn.addEventListener('click', toggleTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        if (fireSound) fireSound.volume = volume;

        // Save to settings
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        settings.volume = volume;
        localStorage.setItem('settings', JSON.stringify(settings));

        // Sync with settings slider if it exists
        const settingsVolumeSlider = document.getElementById('volumeSettings');
        if (settingsVolumeSlider) {
            settingsVolumeSlider.value = volume;
            const volumeValue = document.getElementById('volumeValue');
            if (volumeValue) {
                volumeValue.textContent = Math.round(volume * 100) + '%';
            }
        }
    });
}

// Todo Logic
function addTodo() {
    const text = todoInput?.value.trim();
    if (text) {
        todos.push({ id: Date.now(), text, completed: false });
        if (todoInput) todoInput.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    if (window.saveToFirestore) {
        window.saveToFirestore('todos', todos);
    }
}

function updateGlobalTodos(newTodos) {
    todos = newTodos;
    renderTodos();
}
window.updateGlobalTodos = updateGlobalTodos;

function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <button class="delete-todo" onclick="deleteTodo(${todo.id})">✕</button>
        `;
        todoList.appendChild(li);
    });
}

window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

if (addTodoBtn) addTodoBtn.addEventListener('click', addTodo);
if (todoInput) {
    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTodo();
        }
    });
}

init();

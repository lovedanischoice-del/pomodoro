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

// Onboarding Slide Logic
let currentSlide = 0;
const totalSlides = 3;

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
    }
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.onboarding-slide');
    slides.forEach((s, i) => {
        s.style.display = i === index ? 'block' : 'none';
    });
    currentSlide = index;
}

window.nextSlide = nextSlide;
window.goToSlide = goToSlide;

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
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 45;
const LONG_REST_TIME = 15 * 60; // 긴 휴식 15분

// 설정에서 타이머 시간 가져오기
function getWorkTime() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    return (settings.workDuration || 20) * 60;
}
function getRestTime() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    return (settings.restDuration || 5) * 60;
}
function isAutoStart() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    return settings.autoStart !== false;
}

// State Variables
var timeLeft = getWorkTime();
var isRunning = false;
var isWorkMode = true;
var timerId = null;
var pomodoroCount = 0; // 완료한 뽀모도로 수
var isLongRest = false; // 긴 휴식 중인지
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 타이머 시간 갱신 (설정 변경 시 외부에서 호출)
function refreshTimerSettings() {
    if (!isRunning) {
        timeLeft = isWorkMode ? getWorkTime() : getRestTime();
        updateDisplay();
        updateProgress(0);
    }
}
window.refreshTimerSettings = refreshTimerSettings;

// Initialization
function init() {
    timeLeft = getWorkTime();
    updateDisplay();
    updateProgress(0);
    updatePomodoroCounter();
    renderTodos();
    // 저장된 볼륨 불러오기
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const savedVolume = settings.volume || 0.5;
    if (fireSound) fireSound.volume = savedVolume;
    if (volumeSlider) volumeSlider.value = savedVolume;
}

// Timer Logic
function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        const totalTime = isWorkMode ? getWorkTime() : (isLongRest ? LONG_REST_TIME : getRestTime());
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
    const workTimeMin = getWorkTime() / 60;
    const restTimeMin = isLongRest ? LONG_REST_TIME / 60 : getRestTime() / 60;
    const completedDuration = isWorkMode ? workTimeMin : restTimeMin;
    const sessionType = isWorkMode ? 'work' : 'rest';

    if (typeof statsManager !== 'undefined') {
        statsManager.addSession(completedDuration, sessionType);
    }

    playChimeBell();

    if (isWorkMode) {
        // 워크 세션 완료 → 뽀모도로 카운트 증가
        pomodoroCount++;
        updatePomodoroCounter();

        // 4 뽀모도로마다 긴 휴식
        if (pomodoroCount % 4 === 0) {
            isLongRest = true;
            timeLeft = LONG_REST_TIME;
        } else {
            isLongRest = false;
            timeLeft = getRestTime();
        }
        isWorkMode = false;
    } else {
        // 휴식 완료 → 워크 모드로
        isLongRest = false;
        isWorkMode = true;
        timeLeft = getWorkTime();
    }

    // Auto-start 처리
    const autoStartEnabled = isAutoStart();
    if (!autoStartEnabled) {
        clearInterval(timerId);
        isRunning = false;
        if (toggleText) toggleText.textContent = 'START';
        document.body.classList.remove('timer-running', 'timer-rest');
    }

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
        let badgeText = isWorkMode ? 'WORK' : (isLongRest ? 'LONG REST' : 'REST');
        statusBadge.textContent = badgeText;
        statusBadge.style.background = isWorkMode ? 'var(--accent-work)' : 'var(--accent-rest)';
        statusBadge.style.boxShadow = isWorkMode ? '0 0 20px rgba(255, 107, 107, 0.4)' : '0 0 20px rgba(78, 205, 196, 0.4)';
    }
    if (timeSub) {
        timeSub.textContent = isWorkMode ? 'WORK SESSION' : (isLongRest ? 'LONG BREAK ☕' : 'REST BREAK');
    }
    if (timerProgress) {
        if (isWorkMode) {
            timerProgress.style.stroke = 'url(#gradient)';
        } else {
            timerProgress.style.stroke = isLongRest ? '#a55eea' : '#4ecdc4';
        }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Bbangmodoro', {
            body: isWorkMode ? `🍅 Work time! (Session #${pomodoroCount + 1})` : (isLongRest ? '☕ Long break! 15 minutes' : '😌 Rest time!'),
            icon: 'icon-192.png'
        });
    }

    handleSound();
    updateDisplay();
    updateProgress(0);
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
    isLongRest = false;
    pomodoroCount = 0;
    timeLeft = getWorkTime();

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

    updatePomodoroCounter();
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

// 뽀모도로 카운터 UI 업데이트
function updatePomodoroCounter() {
    const counterEl = document.getElementById('pomodoroCounter');
    if (!counterEl) return;
    const dots = [];
    for (let i = 0; i < 4; i++) {
        const filled = i < (pomodoroCount % 4);
        dots.push(`<span class="pomo-dot ${filled ? 'filled' : ''}">🍅</span>`);
    }
    counterEl.innerHTML = dots.join('');
}
window.updatePomodoroCounter = updatePomodoroCounter;

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

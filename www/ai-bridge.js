// ==============================================
// AI Bridge - Gemini API로 목표를 구체적 행동으로 쪼개기
// ==============================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Gemini API로 목표를 구체적 행동 단계로 분해
 * @param {string} goal - 사용자 입력 목표
 * @returns {Promise<string[]>} - 행동 단계 배열
 */
async function breakdownGoalWithAI(goal) {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) throw new Error('API_KEY_MISSING');
    if (!goal.trim()) throw new Error('EMPTY_GOAL');

    const prompt = `포모도로 타이머 앱 사용자가 지금 바로 시작할 작업을 입력했습니다.
이 목표를 지금 당장 눈앞에서 할 수 있는 구체적인 행동 2~4개로 쪼개주세요.

규칙:
- 각 행동은 5분 이내에 완료 가능한 아주 작은 단계여야 합니다
- 번호 없이 행동만 한 줄씩 작성하세요 (예: "VS Code 열기")
- 한국어로 답하세요
- 각 행동은 동사로 시작해야 합니다
- 최대 4개만 작성하세요

목표: "${goal}"

행동 목록:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 256,
            }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 400) throw new Error('INVALID_KEY');
        if (response.status === 429) throw new Error('RATE_LIMIT');
        throw new Error('API_ERROR');
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 줄 단위로 분리, 빈 줄 제거, 번호/기호 제거
    const steps = text
        .split('\n')
        .map(line => line.replace(/^[\d.\-\*\•]+\s*/, '').trim())
        .filter(line => line.length > 2)
        .slice(0, 4);

    if (steps.length === 0) throw new Error('PARSE_ERROR');
    return steps;
}

/**
 * AI 쪼개기 버튼 클릭 핸들러
 * @param {HTMLInputElement} inputEl - 목표 입력창
 * @param {HTMLElement} stepsEl - 결과 표시 영역
 * @param {HTMLElement} btnEl - AI 버튼
 */
async function handleAIBreakdown(inputEl, stepsEl, btnEl) {
    const goal = inputEl?.value?.trim();
    if (!goal) {
        showAISteps(stepsEl, null, '먼저 목표를 입력해주세요 😊');
        return;
    }

    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        showAISteps(stepsEl, null, '⚙️ Settings에서 Gemini API Key를 먼저 입력해주세요');
        return;
    }

    // 로딩 상태
    setAIBtnLoading(btnEl, true);
    showAISteps(stepsEl, null, '✨ AI가 쪼개는 중...');

    try {
        const steps = await breakdownGoalWithAI(goal);
        showAISteps(stepsEl, steps, null);

        // 첫 번째 단계를 입력창에 자동 채워넣기
        if (inputEl && steps.length > 0) {
            inputEl.value = steps[0];
            inputEl.focus();
        }
    } catch (err) {
        const messages = {
            API_KEY_MISSING: '⚙️ Settings에서 API Key를 입력해주세요',
            INVALID_KEY: '🔑 API Key가 올바르지 않습니다',
            RATE_LIMIT: '⏳ 잠시 후 다시 시도해주세요',
            EMPTY_GOAL: '먼저 목표를 입력해주세요',
            PARSE_ERROR: '결과를 파싱하지 못했어요. 다시 시도해주세요',
            API_ERROR: '🌐 API 오류가 발생했습니다',
        };
        showAISteps(stepsEl, null, messages[err.message] || '오류가 발생했습니다: ' + err.message);
    } finally {
        setAIBtnLoading(btnEl, false);
    }
}

function showAISteps(container, steps, errorMsg) {
    if (!container) return;
    container.innerHTML = '';
    container.classList.remove('hidden');

    if (errorMsg) {
        container.innerHTML = `<div class="ai-error">${errorMsg}</div>`;
        return;
    }

    if (steps && steps.length > 0) {
        const label = document.createElement('div');
        label.className = 'ai-steps-label';
        label.textContent = '✨ 지금 이것부터:';
        container.appendChild(label);

        const list = document.createElement('ol');
        list.className = 'ai-steps-list';
        steps.forEach((step, i) => {
            const li = document.createElement('li');
            li.className = 'ai-step-item' + (i === 0 ? ' ai-step-first' : '');
            li.textContent = step;
            // 클릭하면 입력창에 채워지도록
            li.onclick = () => {
                const inp = document.getElementById('microActionInput');
                if (inp) { inp.value = step; inp.focus(); }
            };
            list.appendChild(li);
        });
        container.appendChild(list);

        const hint = document.createElement('div');
        hint.className = 'ai-steps-hint';
        hint.textContent = '👆 클릭하면 첫 번째 행동이 선택됩니다';
        container.appendChild(hint);
    }
}

function setAIBtnLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? '⏳ 쪼개는 중...' : '✨ AI로 쪼개기';
    btn.classList.toggle('ai-loading', loading);
}

window.handleAIBreakdown = handleAIBreakdown;
window.breakdownGoalWithAI = breakdownGoalWithAI;

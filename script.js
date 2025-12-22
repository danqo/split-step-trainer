document.addEventListener('DOMContentLoaded', function() {
    const arrow = document.getElementById('arrow');
    const arrowContainer = document.querySelector('.arrow-container');
    const minIntervalInput = document.getElementById('minInterval');
    const maxIntervalInput = document.getElementById('maxInterval');
    const errorMessage = document.getElementById('errorMessage');
    const showCountdownToggle = document.getElementById('showCountdown');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownText = document.getElementById('countdownText');
    const darkModeToggle = document.getElementById('darkMode');

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenView = document.getElementById('fullscreenView');
    const exitFullscreen = document.getElementById('exitFullscreen');
    const fullscreenArrow = document.getElementById('fullscreenArrow');
    const fullscreenArrowContainer = document.querySelector('.fullscreen-arrow-container');

    // Default intervals
    let minInterval = 1;
    let maxInterval = 5;

    const directions = [
        { name: 'East', angle: 0 },
        { name: 'West', angle: 180 },
        { name: 'Northeast', angle: -45 },
        { name: 'Southeast', angle: 45 },
        { name: 'Northwest', angle: -135 },
        { name: 'Southwest', angle: 135 }
    ];

    let timeoutId = null;
    let countdownIntervalId = null;
    let nextChangeTime = 0;

    function getEnabledDirections() {
        const checkedBoxes = document.querySelectorAll('#directionOptions input[type="checkbox"]:checked');
        const enabledNames = Array.from(checkedBoxes).map(cb => cb.value);
        return directions.filter(d => enabledNames.includes(d.name));
    }

    function getRandomDirection() {
        const enabled = getEnabledDirections();
        if (enabled.length === 0) return null;
        return enabled[Math.floor(Math.random() * enabled.length)];
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }

    function updateIntervals() {
        let min = parseInt(minIntervalInput.value) || 1;
        let max = parseInt(maxIntervalInput.value) || 5;

        if (min < 1) { min = 1; minIntervalInput.value = 1; showError('Minimum interval must be at least 1 second'); }
        if (max > 60) { max = 60; maxIntervalInput.value = 60; showError('Maximum interval must be 60 seconds or less'); }
        if (min > max) { min = max; minIntervalInput.value = max; showError('Min cannot be greater than max. Auto-corrected.'); }
        if (max < min) { max = min; maxIntervalInput.value = min; showError('Max cannot be less than min. Auto-corrected.'); }

        minInterval = min;
        maxInterval = max;

        hideError();
        scheduleNextUpdate();
        return true;
    }

    function getRandomInterval() {
        const minMs = Math.max(1, minInterval) * 1000;
        const maxMs = Math.min(60, maxInterval) * 1000;
        return Math.floor(Math.random() * (maxMs - minMs) + minMs);
    }

    document.querySelectorAll('#directionOptions input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('#directionOptions input[type="checkbox"]:checked');
            if (checked.length === 0) { cb.checked = true; showError('At least one direction must be selected.'); }
            else { hideError(); }
        });
    });

    function rotateArrow(arrowElement, angle) {
        arrowElement.style.transition = 'none';
        arrowElement.style.transform = `rotate(${angle}deg)`;
        void arrowElement.offsetWidth; // force reflow
    }

    function applyPopAnimation(container) {
        container.style.transition = 'none';
        container.style.transform = 'scale(2)';
        void container.offsetWidth;
        container.style.transition = 'transform 1.2s ease-out';
        container.style.transform = 'scale(1)';
    }

    function updateDirection() {
        const direction = getRandomDirection();
        if (!direction) { showError('At least one direction must remain selected.'); return; }

        // Main arrow
        rotateArrow(arrow, direction.angle);
        applyPopAnimation(arrowContainer);

        // Fullscreen arrow
        if (!fullscreenView.classList.contains('hidden')) {
            rotateArrow(fullscreenArrow, direction.angle);
            applyPopAnimation(fullscreenArrowContainer); // <-- pop effect on container
        }

        scheduleNextUpdate();
        if (showCountdownToggle.checked) updateCountdownDisplay();
    }

    function updateCountdownDisplay() {
        if (!showCountdownToggle.checked) return;
        const remainingMs = Math.max(0, nextChangeTime - Date.now());
        countdownText.textContent = (remainingMs / 1000).toFixed(1);
    }

    function toggleCountdown() {
        if (countdownIntervalId) { clearInterval(countdownIntervalId); countdownIntervalId = null; }
        if (showCountdownToggle.checked) {
            countdownDisplay.style.display = 'block';
            updateCountdownDisplay();
            countdownIntervalId = setInterval(updateCountdownDisplay, 50);
        } else {
            countdownDisplay.style.display = 'none';
        }
    }

    function scheduleNextUpdate() {
        if (timeoutId) clearTimeout(timeoutId);
        const interval = getRandomInterval();
        nextChangeTime = Date.now() + interval;
        timeoutId = setTimeout(updateDirection, interval);
        if (showCountdownToggle.checked) updateCountdownDisplay();
    }

    minIntervalInput.addEventListener('change', updateIntervals);
    maxIntervalInput.addEventListener('change', updateIntervals);

    minIntervalInput.addEventListener('input', function() {
        const min = parseInt(minIntervalInput.value) || 1;
        const max = parseInt(maxIntervalInput.value) || 5;
        if (min > max && maxIntervalInput.value) maxIntervalInput.value = min;
        hideError();
    });

    maxIntervalInput.addEventListener('input', function() {
        const min = parseInt(minIntervalInput.value) || 1;
        const max = parseInt(maxIntervalInput.value) || 5;
        if (max < min && minIntervalInput.value) minIntervalInput.value = max;
        hideError();
    });

    showCountdownToggle.addEventListener('change', toggleCountdown);

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', toggleDarkMode);

    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsContent = document.getElementById('settingsContent');
    const settingsHeader = document.querySelector('.settings-header');
    settingsHeader.addEventListener('click', function() {
        settingsContent.classList.toggle('collapsed');
        toggleSettingsBtn.classList.toggle('collapsed');
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function() {
        fullscreenView.classList.remove('hidden');
    });

    exitFullscreen.addEventListener('click', function() {
        fullscreenView.classList.add('hidden');
    });

    // Initialize
    updateDirection();
    toggleCountdown();
});

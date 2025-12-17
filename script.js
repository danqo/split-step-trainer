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
    
    // Default configuration: minimum and maximum interval in seconds
    let minInterval = 1;  // Minimum 1 second
    let maxInterval = 5;  // Maximum less than or equal to 60 seconds
    
    // The six possible directions
    // Arrow points right (East) by default, so we adjust angles:
    // 3 o'clock (East) = 0°, 9 o'clock (West) = 180°
    // 45° north/south of those positions
    const directions = [
        { name: 'East', angle: 0 },           // 3 o'clock (East)
        { name: 'West', angle: 180 },         // 9 o'clock (West)
        { name: 'Northeast', angle: -45 },    // 45° north of 3 o'clock
        { name: 'Southeast', angle: 45 },     // 45° south of 3 o'clock
        { name: 'Northwest', angle: -135 },   // 45° north of 9 o'clock (or 225°)
        { name: 'Southwest', angle: 135 }     // 45° south of 9 o'clock
    ];
    
    let currentDirection = 0;
    let timeoutId = null;
    let countdownIntervalId = null;
    let timeRemaining = 0;
    let nextChangeTime = 0;
    
    // Function to get a random direction (different from current)
    function getRandomDirection() {
        let newDirection;
        do {
            newDirection = Math.floor(Math.random() * directions.length);
        } while (newDirection === currentDirection && directions.length > 1);
        return newDirection;
    }
    
    // Function to validate and update intervals
    function updateIntervals() {
        let min = parseInt(minIntervalInput.value) || 1;
        let max = parseInt(maxIntervalInput.value) || 5;
        
        // Validation and auto-correction
        if (min < 1) {
            showError('Minimum interval must be at least 1 second');
            minIntervalInput.value = 1;
            min = 1;
        }
        
        if (max > 60) {
            showError('Maximum interval must be 60 seconds or less');
            maxIntervalInput.value = 60;
            max = 60;
        }
        
        // Auto-correct if min > max
        if (min > max) {
            showError('Minimum interval cannot be greater than maximum interval. Auto-correcting...');
            minIntervalInput.value = max;
            min = max;
        }
        
        // Auto-correct if max < min
        if (max < min) {
            showError('Maximum interval cannot be less than minimum interval. Auto-correcting...');
            maxIntervalInput.value = min;
            max = min;
        }
        
        hideError();
        minInterval = min;
        maxInterval = max;
        
        // Reschedule with new intervals
        scheduleNextUpdate();
        return true;
    }
    
    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
    
    // Function to hide error message
    function hideError() {
        errorMessage.classList.remove('show');
    }
    
    // Function to get a random interval between min and max (in milliseconds)
    function getRandomInterval() {
        const min = Math.max(1, minInterval); // Ensure minimum is at least 1
        const max = Math.min(60, maxInterval); // Ensure maximum is less than or equal to 60
        // Generate random milliseconds between min*1000 and max*1000
        const minMs = min * 1000;
        const maxMs = max * 1000;
        const randomMs = Math.random() * (maxMs - minMs) + minMs;
        return Math.floor(randomMs); // Return in milliseconds
    }
    
    // Function to update the arrow direction
    function updateDirection() {
        currentDirection = getRandomDirection();
        const direction = directions[currentDirection];
        
        // Remove all transitions for instant changes
        arrow.style.transition = 'none';
        arrowContainer.style.transition = 'none';
        
        // Rotate arrow instantly, scale container up instantly (bang effect)
        arrow.style.transform = `rotate(${direction.angle}deg)`;
        arrowContainer.style.transform = 'scale(2)';
        
        // Force reflow to ensure instant change
        void arrow.offsetWidth;
        void arrowContainer.offsetWidth;
        
        // Now add transition back only for scale-down animation (slower)
        arrowContainer.style.transition = 'transform 1.2s ease-out';
        
        // Scale container back to normal smoothly
        arrowContainer.style.transform = 'scale(1)';
        
        // Schedule next update with random interval
        scheduleNextUpdate();
        
        // Update countdown if toggle is on
        if (showCountdownToggle.checked) {
            updateCountdownDisplay();
        }
    }
    
    // Function to update countdown display
    function updateCountdownDisplay() {
        if (!showCountdownToggle.checked) {
            return;
        }
        
        const now = Date.now();
        const remainingMs = Math.max(0, nextChangeTime - now);
        timeRemaining = remainingMs;
        
        if (remainingMs > 0) {
            // Show with one decimal place for granularity
            const remainingSeconds = (remainingMs / 1000).toFixed(1);
            countdownText.textContent = remainingSeconds;
        } else {
            countdownText.textContent = '0.0';
        }
    }
    
    // Function to start/stop countdown interval
    function toggleCountdown() {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        
        if (showCountdownToggle.checked) {
            countdownDisplay.style.display = 'block';
            updateCountdownDisplay();
            // Update every 50ms for smooth countdown
            countdownIntervalId = setInterval(updateCountdownDisplay, 50);
        } else {
            countdownDisplay.style.display = 'none';
        }
    }
    
    // Function to schedule the next direction change
    function scheduleNextUpdate() {
        if (timeoutId) clearTimeout(timeoutId);
        
        const interval = getRandomInterval();
        nextChangeTime = Date.now() + interval;
        timeRemaining = interval;
        
        timeoutId = setTimeout(() => {
            updateDirection();
        }, interval);
        
        // Update countdown if toggle is on
        if (showCountdownToggle.checked) {
            updateCountdownDisplay();
        }
    }
    
    // Event listeners for interval inputs
    minIntervalInput.addEventListener('change', updateIntervals);
    minIntervalInput.addEventListener('input', function() {
        const min = parseInt(minIntervalInput.value) || 1;
        const max = parseInt(maxIntervalInput.value) || 5;
        
        // Real-time validation: if min > max, adjust max
        if (min > max && maxIntervalInput.value) {
            maxIntervalInput.value = min;
        }
        hideError();
    });
    
    maxIntervalInput.addEventListener('change', updateIntervals);
    maxIntervalInput.addEventListener('input', function() {
        const min = parseInt(minIntervalInput.value) || 1;
        const max = parseInt(maxIntervalInput.value) || 5;
        
        // Real-time validation: if max < min, adjust min
        if (max < min && minIntervalInput.value) {
            minIntervalInput.value = max;
        }
        hideError();
    });
    
    // Event listener for countdown toggle
    showCountdownToggle.addEventListener('change', toggleCountdown);
    
    // Dark mode functionality
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // Event listener for dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Event listener for settings collapse/expand
    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsContent = document.getElementById('settingsContent');
    const settingsHeader = document.querySelector('.settings-header');
    
    settingsHeader.addEventListener('click', function() {
        settingsContent.classList.toggle('collapsed');
        toggleSettingsBtn.classList.toggle('collapsed');
    });
    
    // Initialize
    updateDirection();
});


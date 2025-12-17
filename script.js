document.addEventListener('DOMContentLoaded', function() {
    const clickBtn = document.getElementById('clickBtn');
    const message = document.getElementById('message');
    let clickCount = 0;
    
    clickBtn.addEventListener('click', function() {
        clickCount++;
        message.textContent = `You've clicked the button ${clickCount} time${clickCount !== 1 ? 's' : ''}! 🎉`;
        message.classList.add('show');
        
        // Add a little animation
        clickBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickBtn.style.transform = '';
        }, 100);
    });
});


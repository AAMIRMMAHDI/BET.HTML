// Game variables
let balance = 10000000000000000000000000000000000000000000000000;
let betAmount = 10;
let cashOutMultiplier = 1.5;
let gameStatus = 'waiting'; // waiting, playing, crashed
let currentMultiplier = 1.0;
let gameInterval;
let history = [];
let autoCashOut = false;
let multiplierHistory = [];

// DOM Elements
const balanceElement = document.getElementById('balance');
const betAmountInput = document.getElementById('bet-amount');
const currentMultiplierElement = document.getElementById('current-multiplier');
const cashOutBtn = document.getElementById('cash-out-btn');
const cashOutAmountDisplay = document.getElementById('cash-out-amount');
const startGameBtn = document.getElementById('start-game');
const autoCashoutCheckbox = document.getElementById('auto-cashout');
const autoCashoutGroup = document.getElementById('auto-cashout-group');
const cashoutMultiplierInput = document.getElementById('cashout-multiplier');
const cashoutValueElement = document.getElementById('cashout-value');
const quickBetButtons = document.querySelectorAll('.quick-bet');
const historyItemsContainer = document.getElementById('history-items');
const liveChartCanvas = document.getElementById('live-chart');
const explosionSound = document.getElementById('explosion-sound');
const clickSound = document.getElementById('click-sound');

// Initialize game
function initGame() {
    updateBalance();
    setupEventListeners();
    renderHistory();
    initChart();
}

// Initialize chart
function initChart() {
    liveChartCanvas.width = liveChartCanvas.clientWidth;
    liveChartCanvas.height = liveChartCanvas.clientHeight;
    
    // Simple chart drawing without using external libraries
    drawEmptyChart();
}

// Draw empty chart
function drawEmptyChart() {
    const ctx = liveChartCanvas.getContext('2d');
    ctx.clearRect(0, 0, liveChartCanvas.width, liveChartCanvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#4a4e69';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(50, liveChartCanvas.height - 50);
    ctx.lineTo(liveChartCanvas.width - 20, liveChartCanvas.height - 50);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, liveChartCanvas.height - 50);
    ctx.stroke();
    
    // Draw grid and labels
    ctx.fillStyle = '#a1a1a1';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Y axis labels (multiplier values)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
        const y = liveChartCanvas.height - 50 - (i * (liveChartCanvas.height - 70) / 10);
        ctx.fillText(i + 'x', 45, y + 4);
        
        // Grid line
        ctx.strokeStyle = '#4a4e69';
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(liveChartCanvas.width - 20, y);
        ctx.stroke();
    }
}

// Update live chart during game
function updateLiveChart() {
    const ctx = liveChartCanvas.getContext('2d');
    multiplierHistory.push(currentMultiplier);
    drawEmptyChart();
    
    // Draw live line
    ctx.strokeStyle = '#f8961e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxMultiplier = Math.max(...multiplierHistory, 10);
    const xStep = (liveChartCanvas.width - 70) / 100;
    
    multiplierHistory.forEach((value, index) => {
        const x = 50 + (index * xStep);
        const y = liveChartCanvas.height - 50 - ((value / maxMultiplier) * (liveChartCanvas.height - 70));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#f8961e';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.stroke();
}

// Update multiplier display
function updateMultiplierDisplay() {
    currentMultiplierElement.textContent = currentMultiplier.toFixed(2) + 'x';
}

// Update balance display
function updateBalance() {
    balanceElement.textContent = balance.toLocaleString();
}

// Update cash out amount display
function updateCashOutAmount() {
    cashOutAmountDisplay.textContent = Math.floor(betAmount * currentMultiplier).toLocaleString();
}

// Setup event listeners
function setupEventListeners() {
    startGameBtn.addEventListener('click', startGame);
    cashOutBtn.addEventListener('click', cashOut);
    
    autoCashoutCheckbox.addEventListener('change', function() {
        autoCashOut = this.checked;
        autoCashoutGroup.style.display = autoCashOut ? 'block' : 'none';
    });
    
    cashoutMultiplierInput.addEventListener('input', function() {
        cashOutMultiplier = parseFloat(this.value);
        cashoutValueElement.textContent = cashOutMultiplier.toFixed(1) + 'x';
    });
    
    quickBetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            if (amount === 'all') {
                betAmountInput.value = balance;
            } else {
                betAmountInput.value = amount;
            }
            betAmount = parseFloat(betAmountInput.value);
        });
    });
    
    betAmountInput.addEventListener('change', function() {
        betAmount = parseFloat(this.value) || 10;
    });
}

// Start game
function startGame() {
    if (gameStatus !== 'waiting') return;
    if (betAmount > balance) {
        alert('موجودی کافی نیست!');
        return;
    }
    
    gameStatus = 'playing';
    balance -= betAmount;
    updateBalance();
    currentMultiplier = 1.0;
    multiplierHistory = [];
    updateMultiplierDisplay();
    updateCashOutAmount();
    startGameBtn.disabled = true;
    cashOutBtn.disabled = false;
    currentMultiplierElement.classList.add('animating');
    
    // Simulate game
    gameInterval = setInterval(updateGame, 100);
}

// Update game state
function updateGame() {
    // Increase multiplier
    currentMultiplier += 0.01;
    updateMultiplierDisplay();
    updateCashOutAmount();
    updateLiveChart();
    
    // Random crash point (between 1.2x and 10x)
    const crashPoint = Math.random() * 8.8 + 1.2;
    
    // Check if game should crash
    if (currentMultiplier >= crashPoint || (autoCashOut && currentMultiplier >= cashOutMultiplier)) {
        endGame(currentMultiplier >= crashPoint ? crashPoint : currentMultiplier);
    }
}

// End game
function endGame(crashAt) {
    clearInterval(gameInterval);
    gameStatus = 'crashed';
    currentMultiplierElement.classList.remove('animating');
    
    // Play sound
    explosionSound.currentTime = 0;
    explosionSound.play();
    
    // Calculate winnings if cashed out
    const didCashOut = crashAt > currentMultiplier;
    if (didCashOut) {
        const winnings = betAmount * currentMultiplier;
        balance += winnings;
        updateBalance();
        addToHistory(currentMultiplier, true);
    } else {
        addToHistory(crashAt, false);
    }
    
    // Reset for next game
    setTimeout(() => {
        gameStatus = 'waiting';
        startGameBtn.disabled = false;
        cashOutBtn.disabled = true;
        currentMultiplier = 1.0;
        updateMultiplierDisplay();
        updateCashOutAmount();
        drawEmptyChart();
    }, 3000);
}

// Cash out
function cashOut() {
    if (gameStatus !== 'playing') return;
    
    clickSound.currentTime = 0;
    clickSound.play();
    
    const winnings = betAmount * currentMultiplier;
    balance += winnings;
    updateBalance();
    addToHistory(currentMultiplier, true);
    
    clearInterval(gameInterval);
    gameStatus = 'waiting';
    startGameBtn.disabled = false;
    cashOutBtn.disabled = true;
    currentMultiplier = 1.0;
    updateMultiplierDisplay();
    updateCashOutAmount();
    drawEmptyChart();
}

// Add result to history
function addToHistory(multiplier, isSuccess) {
    const now = new Date();
    const timeString = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
    
    history.unshift({
        multiplier: multiplier.toFixed(2),
        time: timeString,
        success: isSuccess
    });
    
    if (history.length > 15) {
        history.pop();
    }
    
    renderHistory();
}

// Render history list
function renderHistory() {
    historyItemsContainer.innerHTML = '';
    
    history.forEach(item => {
        const className = item.success ? 'history-item green' : 'history-item red';
        const historyItem = document.createElement('div');
        historyItem.className = className;
        historyItem.innerHTML = `
            <div>${item.multiplier}x</div>
            <small>${item.time}</small>
        `;
        historyItemsContainer.appendChild(historyItem);
    });
    
    // Scroll to newest item
    const scrollContainer = document.getElementById('history-scroll');
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
}

// Initialize the game when page loads
window.addEventListener('load', initGame);



/* برای لاگین ثبت نام و فراموشی رمز عبور هستش */




// مدیریت فرم لاگین
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // اینجا می‌توانید لاگین کاربر را شبیه‌سازی کنید
    console.log('ورود با:', { email, password });
    alert('ورود با موفقیت انجام شد (شبیه‌سازی)');
    // window.location.href = 'index.html'; // ریدایرکت به صفحه اصلی بعد از لاگین
});

// مدیریت فرم ثبت‌نام
document.getElementById('signup-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('رمز عبور و تکرار آن مطابقت ندارند');
        return;
    }
    
    // اینجا می‌توانید ثبت‌نام کاربر را شبیه‌سازی کنید
    console.log('ثبت‌نام با:', { email, password });
    alert('ثبت‌نام با موفقیت انجام شد (شبیه‌سازی)');
    // window.location.href = 'login.html'; // ریدایرکت به صفحه لاگین بعد از ثبت‌نام
});

// مدیریت فرم فراموشی رمز عبور
document.getElementById('forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('forgot-password-modal').style.display = 'block';
});

document.querySelector('.close-modal')?.addEventListener('click', function() {
    document.getElementById('forgot-password-modal').style.display = 'none';
});

document.getElementById('forgot-password-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('recovery-email').value;
    
    // اینجا می‌توانید بازیابی رمز عبور را شبیه‌سازی کنید
    console.log('بازیابی رمز برای:', { email });
    alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد (شبیه‌سازی)');
    document.getElementById('forgot-password-modal').style.display = 'none';
});

// بستن مودال با کلیک خارج از آن
window.addEventListener('click', function(e) {
    const modal = document.getElementById('forgot-password-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});



/* داشبور میباشد */






// اسکریپت‌های سمت کلاینت برای داشبورد
document.addEventListener('DOMContentLoaded', function() {
    // اینجا می‌توانید اسکریپت‌های مربوط به تعاملات داشبورد را اضافه کنید
    console.log('داشبورد کاربر آماده است');
    
    // مثال: نمایش تاریخ و ساعت فعلی
    function updateDateTime() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTimeStr = now.toLocaleDateString('fa-IR', options);
        // می‌توانید این مقدار را در جایی از صفحه نمایش دهید
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // مثال: مدیریت کلیک روی دکمه‌ها
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            alert('این یک دکمه نمونه است و در نسخه فرانت‌اند فعلی عملیاتی نیست');
        });
    });
    
    // می‌توانید اینجا اسکریپت‌های بیشتری برای تعاملات صفحه اضافه کنید
});






/* PLINKO */





document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const multiDropBtn = document.getElementById('multi-drop-btn');
    const rowsSelect = document.getElementById('rows');
    const betAmount = document.getElementById('bet-amount');
    const balanceDisplay = document.getElementById('balance');
    const historyList = document.getElementById('history-list');
    const slots = document.querySelectorAll('.slot');
    const bounceSound = document.getElementById('bounce-sound');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');

    // Game State
    let balance = 10000;
    let activeBalls = 0;
    let pegs = [];
    let animationIds = [];

    // Initialize Game
    function initGame() {
        updateBalance();
        createPegs(parseInt(rowsSelect.value));
    }

    // Create Pegs with Boundary Check
    function createPegs(rows) {
        gameBoard.innerHTML = '';
        pegs = [];
        const width = gameBoard.clientWidth;
        const height = gameBoard.clientHeight;
        const pegSpacing = 30;
        const boundaryPadding = 20;

        for (let row = 1; row <= rows; row++) {
            const pegsInRow = row;
            for (let col = 0; col < pegsInRow; col++) {
                const x = (width / 2) + (col - (pegsInRow - 1) / 2) * pegSpacing;
                const y = (height * 0.1) + row * pegSpacing;
                
                // Check if peg is within boundaries
                if (x >= boundaryPadding && x <= width - boundaryPadding) {
                    const peg = document.createElement('div');
                    peg.className = 'peg';
                    peg.style.left = `${x}px`;
                    peg.style.top = `${y}px`;
                    gameBoard.appendChild(peg);
                    pegs.push({ x, y });
                }
            }
        }
    }

    // Drop Ball with Physics
    function dropBall() {
        if (activeBalls >= 5) return;
        
        const bet = parseInt(betAmount.value);
        if (bet > balance || bet < 100) {
            alert(bet < 100 ? "حداقل شرط 100 تومان است!" : "موجودی کافی نیست!");
            return;
        }

        balance -= bet;
        updateBalance();
        activeBalls++;
        startBtn.disabled = activeBalls >= 5;

        const ball = document.createElement('div');
        ball.className = 'ball';
        const ballRadius = 6;
        let posX = gameBoard.clientWidth / 2 - ballRadius;
        let posY = 0;
        let velocityX = (Math.random() - 0.5) * 4;
        let velocityY = 0;
        const gravity = 0.2;
        const friction = 0.99;

        ball.style.left = `${posX}px`;
        ball.style.top = `${posY}px`;
        gameBoard.appendChild(ball);

        // Physics Animation
        function animate() {
            velocityY += gravity;
            velocityX *= friction;
            
            posY += velocityY;
            posX += velocityX;

            // Wall Collision
            if (posX <= 0 || posX >= gameBoard.clientWidth - ballRadius * 2) {
                velocityX *= -0.8;
                posX = posX <= 0 ? 0 : gameBoard.clientWidth - ballRadius * 2;
                playBounceSound();
            }

            // Peg Collision
            for (const peg of pegs) {
                const dx = posX + ballRadius - peg.x;
                const dy = posY + ballRadius - peg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ballRadius + 5) {
                    const angle = Math.atan2(dy, dx);
                    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                    
                    velocityX = Math.cos(angle) * speed * 0.7;
                    velocityY = Math.sin(angle) * speed * 0.7;
                    
                    ball.classList.add('bounce');
                    setTimeout(() => ball.classList.remove('bounce'), 300);
                    playBounceSound();
                    break;
                }
            }

            ball.style.left = `${posX}px`;
            ball.style.top = `${posY}px`;

            // End Condition
            if (posY < gameBoard.clientHeight - 50) {
                animationIds.push(requestAnimationFrame(animate));
            } else {
                finishGame();
            }
        }

        function finishGame() {
            // Calculate Multiplier
            const slotWidth = gameBoard.clientWidth / slots.length;
            const slotIndex = Math.min(
                Math.floor(posX / slotWidth),
                slots.length - 1
            );
            
            const selectedSlot = slots[slotIndex];
            const multiplier = parseFloat(selectedSlot.dataset.multiplier);
            const win = Math.floor(bet * multiplier);

            // Highlight Slot
            selectedSlot.classList.add('active');
            setTimeout(() => selectedSlot.classList.remove('active'), 2000);

            // Update Balance
            balance += win;
            updateBalance();

            // Play Sound
            if (win > bet) {
                winSound.currentTime = 0;
                winSound.play();
            } else {
                loseSound.currentTime = 0;
                loseSound.play();
            }

            // Add to History
            addHistory(bet, win, multiplier);

            // Remove Ball
            setTimeout(() => {
                ball.remove();
                activeBalls--;
                startBtn.disabled = false;
            }, 2000);
        }

        animationIds.push(requestAnimationFrame(animate));
    }

    // Helper Functions
    function playBounceSound() {
        bounceSound.currentTime = 0;
        bounceSound.play();
    }

    function updateBalance() {
        balanceDisplay.textContent = balance.toLocaleString('fa-IR');
    }

    function addHistory(bet, win, multiplier) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${win > bet ? 'win' : 'lose'}`;
        historyItem.innerHTML = `
            ${win > bet ? '🎉 برد' : '💔 باخت'}:
            <span>${Math.abs(win).toLocaleString('fa-IR')} تومان</span>
            <small>(x${multiplier})</small>
        `;
        historyList.prepend(historyItem);
        
        if (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', dropBall);
    
    multiDropBtn.addEventListener('click', () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(dropBall, i * 300);
        }
    });

    rowsSelect.addEventListener('change', () => {
        // Cancel all animations
        animationIds.forEach(id => cancelAnimationFrame(id));
        animationIds = [];
        activeBalls = 0;
        startBtn.disabled = false;
        
        createPegs(parseInt(rowsSelect.value));
    });

    // Initialize
    initGame();
});
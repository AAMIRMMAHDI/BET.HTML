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


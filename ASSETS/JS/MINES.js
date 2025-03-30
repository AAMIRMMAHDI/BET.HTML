document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-game');
    const cashOutBtn = document.getElementById('cash-out');
    const betAmountInput = document.getElementById('bet-amount');
    const minesCountSelect = document.getElementById('mines-count');
    const balanceDisplay = document.getElementById('balance');
    const remainingDisplay = document.getElementById('remaining');
    const potentialWinDisplay = document.getElementById('potential-win');
    const historyList = document.getElementById('history-list');
    const messageDisplay = document.getElementById('message');
    
    // متغیرهای بازی
    let balance = 1000;
    let currentBet = 0;
    let minesCount = 0;
    let revealedTiles = 0;
    let totalTiles = 25; // 5x5 grid
    let board = [];
    let gameActive = false;
    
    // مقداردهی اولیه
    updateBalance();
    
    // رویداد شروع بازی
    startBtn.addEventListener('click', startNewGame);
    
    // رویداد دریافت سود
    cashOutBtn.addEventListener('click', cashOut);
    
    // شروع بازی جدید
    function startNewGame() {
        const betAmount = parseInt(betAmountInput.value);
        minesCount = parseInt(minesCountSelect.value);
        
        // اعتبارسنجی
        if (isNaN(betAmount) || betAmount < 10) {
            showMessage('لطفا مبلغ شرط را وارد کنید (حداقل 10 تومان)', 'lose');
            return;
        }
        
        if (betAmount > balance) {
            showMessage('موجودی شما کافی نیست', 'lose');
            return;
        }
        
        // تنظیم متغیرهای بازی
        currentBet = betAmount;
        balance -= betAmount;
        revealedTiles = 0;
        gameActive = true;
        
        // به‌روزرسانی نمایشگرها
        updateBalance();
        remainingDisplay.textContent = totalTiles - minesCount;
        potentialWinDisplay.textContent = Math.floor(currentBet * calculateMultiplier());
        
        // ایجاد صفحه بازی
        createBoard();
        
        // فعال/غیرفعال کردن دکمه‌ها
        startBtn.disabled = true;
        betAmountInput.disabled = true;
        minesCountSelect.disabled = true;
        cashOutBtn.disabled = false;
    }
    
    // ایجاد صفحه بازی
    function createBoard() {
        gameBoard.innerHTML = '';
        board = [];
        
        // ایجاد آرایه ماین‌ها
        const minesPositions = [];
        while (minesPositions.length < minesCount) {
            const randomPos = Math.floor(Math.random() * totalTiles);
            if (!minesPositions.includes(randomPos)) {
                minesPositions.push(randomPos);
            }
        }
        
        // ایجاد مربع‌ها
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = i;
            tile.dataset.isMine = minesPositions.includes(i);
            
            tile.addEventListener('click', () => revealTile(tile));
            
            gameBoard.appendChild(tile);
            board.push(tile);
        }
    }
    
    // آشکار کردن مربع
    function revealTile(tile) {
        if (!gameActive || tile.classList.contains('revealed')) return;
        
        tile.classList.add('revealed', 'bounce');
        
        const isMine = tile.dataset.isMine === 'true';
        
        if (isMine) {
            // بازیکن باخته
            tile.classList.add('mine');
            endGame(false);
        } else {
            // مربع ایمن
            tile.classList.add('diamond');
            revealedTiles++;
            
            // محاسبه سود جدید
            const multiplier = calculateMultiplier();
            potentialWinDisplay.textContent = Math.floor(currentBet * multiplier);
            
            // بررسی برنده شدن
            if (revealedTiles === totalTiles - minesCount) {
                endGame(true);
            }
        }
        
        // به‌روزرسانی نمایشگر مربع‌های باقیمانده
        remainingDisplay.textContent = (totalTiles - minesCount) - revealedTiles;
        
        // حذف انیمیشن پس از اتمام
        setTimeout(() => {
            tile.classList.remove('bounce');
        }, 300);
    }
    
    // محاسبه ضریب سود
    function calculateMultiplier() {
        const revealedRatio = revealedTiles / (totalTiles - minesCount);
        const baseMultiplier = 1 + (minesCount / 5);
        return baseMultiplier * (1 + revealedRatio);
    }
    
    // دریافت سود
    function cashOut() {
        if (!gameActive || revealedTiles === 0) return;
        
        const winAmount = Math.floor(currentBet * calculateMultiplier());
        balance += winAmount;
        updateBalance();
        
        showMessage(`شما ${winAmount} تومان دریافت کردید!`, 'win');
        addToHistory(true, winAmount);
        
        resetGame();
    }
    
    // پایان بازی
    function endGame(isWin) {
        gameActive = false;
        
        // نمایش تمام ماین‌ها
        board.forEach(tile => {
            if (tile.dataset.isMine === 'true') {
                tile.classList.add('mine');
            }
        });
        
        if (isWin) {
            const winAmount = Math.floor(currentBet * calculateMultiplier());
            balance += winAmount;
            updateBalance();
            
            showMessage(`تبریک! شما ${winAmount} تومان برنده شدید!`, 'win');
            addToHistory(true, winAmount);
        } else {
            showMessage(`متاسفانه باختید! ${currentBet} تومان از دست دادید.`, 'lose');
            addToHistory(false, currentBet);
        }
        
        resetGame();
    }
    
    // ریست بازی
    function resetGame() {
        startBtn.disabled = false;
        betAmountInput.disabled = false;
        minesCountSelect.disabled = false;
        cashOutBtn.disabled = true;
    }
    
    // اضافه کردن به تاریخچه
    function addToHistory(isWin, amount) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${isWin ? 'history-win' : 'history-lose'}`;
        historyItem.textContent = isWin ? '👍' : '💣';
        historyItem.title = `${isWin ? 'برد' : 'باخت'}: ${amount} تومان`;
        
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // محدود کردن تاریخچه به 15 آیتم
        if (historyList.children.length > 15) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    // نمایش پیام
    function showMessage(text, type) {
        messageDisplay.textContent = text;
        messageDisplay.className = `message ${type}`;
        
        setTimeout(() => {
            messageDisplay.style.display = 'none';
        }, 3000);
        
        messageDisplay.style.display = 'block';
    }
    
    // به‌روزرسانی موجودی
    function updateBalance() {
        balanceDisplay.textContent = balance;
    }
    
    // اعتبارسنجی مبلغ شرط
    betAmountInput.addEventListener('input', () => {
        const amount = parseInt(betAmountInput.value);
        
        if (amount > balance) {
            betAmountInput.value = balance;
        }
    });
});
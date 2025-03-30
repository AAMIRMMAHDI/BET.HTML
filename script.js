document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const cardsContainer = document.getElementById('cards-container');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const placeBetBtn = document.getElementById('place-bet');
    const betAmountInput = document.getElementById('bet-amount');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const balanceDisplay = document.getElementById('balance');
    const winAmountDisplay = document.getElementById('win-amount');
    const messageDisplay = document.getElementById('message');
    
    // متغیرهای بازی
    let cards = [];
    let selectedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = null;
    let seconds = 0;
    let gameStarted = false;
    let currentBet = 0;
    let balance = 1000;
    let winAmount = 0;
    
    // نمادهای کارت‌ها
    const symbols = ['💰', '💎', '🏆', '🎯', '💵', '🃏', '👑', '💍', '🔮', '💸'];
    
    // ایجاد کارت‌های بازی
    function createCards() {
        const pairs = [...symbols, ...symbols].slice(0, 20); // 10 جفت کارت
        return shuffleArray(pairs);
    }
    
    // نمایش کارت‌ها
    function displayCards() {
        cardsContainer.innerHTML = '';
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            cardElement.textContent = card.visible ? card.symbol : '';
            
            if (card.matched) {
                cardElement.classList.add('matched');
            }
            if (card.selected) {
                cardElement.classList.add('selected');
            }
            
            cardElement.addEventListener('click', () => handleCardClick(index));
            cardsContainer.appendChild(cardElement);
        });
    }
    
    // شروع بازی
    function startGame() {
        if (gameStarted) return;
        
        gameStarted = true;
        matchedPairs = 0;
        moves = 0;
        seconds = 0;
        movesDisplay.textContent = `${moves}/6`;
        timeDisplay.textContent = seconds;
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
        
        clearInterval(timer);
        timer = setInterval(() => {
            seconds++;
            timeDisplay.textContent = seconds;
        }, 1000);
        
        const symbolsArray = createCards();
        cards = symbolsArray.map(symbol => ({
            symbol,
            visible: false,
            matched: false,
            selected: false
        }));
        
        displayCards();
        startBtn.disabled = true;
        resetBtn.disabled = true;
        placeBetBtn.disabled = true;
        betAmountInput.disabled = true;
    }
    
    // ریست بازی
    function resetGame() {
        clearInterval(timer);
        gameStarted = false;
        selectedCards = [];
        startBtn.disabled = false;
        resetBtn.disabled = true;
        placeBetBtn.disabled = false;
        betAmountInput.disabled = false;
        displayCards();
    }
    
    // مدیریت کلیک روی کارت
    function handleCardClick(index) {
        if (!gameStarted || cards[index].visible || cards[index].matched || selectedCards.length >= 2) {
            return;
        }
        
        cards[index].visible = true;
        cards[index].selected = true;
        selectedCards.push(index);
        
        if (selectedCards.length === 2) {
            moves++;
            movesDisplay.textContent = `${moves}/6`;
            
            const [firstIndex, secondIndex] = selectedCards;
            if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
                // کارت‌ها یکسان هستند
                cards[firstIndex].matched = true;
                cards[secondIndex].matched = true;
                matchedPairs++;
                
                if (matchedPairs === cards.length / 2) {
                    // بازیکن برنده شده
                    setTimeout(() => {
                        balance += winAmount;
                        balanceDisplay.textContent = balance;
                        showMessage(`برنده شدید! ${winAmount} تومان به موجودی شما اضافه شد`, 'win-message');
                        clearInterval(timer);
                        resetBtn.disabled = false;
                    }, 500);
                }
            } else if (moves >= 6) {
                // بازیکن باخته
                setTimeout(() => {
                    showMessage(`متاسفانه باختید! ${currentBet} تومان از موجودی کسر شد`, 'lose-message');
                    clearInterval(timer);
                    resetBtn.disabled = false;
                }, 500);
            }
            
            setTimeout(() => {
                selectedCards.forEach(i => {
                    cards[i].visible = cards[i].matched;
                    cards[i].selected = false;
                });
                selectedCards = [];
                displayCards();
                
                if (moves >= 6 && matchedPairs < cards.length / 2) {
                    // بازیکن باخته
                    balance -= currentBet;
                    balanceDisplay.textContent = balance;
                    showMessage(`متاسفانه باختید! ${currentBet} تومان از موجودی کسر شد`, 'lose-message');
                    clearInterval(timer);
                    resetBtn.disabled = false;
                }
            }, 1000);
        }
        
        displayCards();
    }
    
    // ثبت شرط
    function placeBet() {
        const betAmount = parseInt(betAmountInput.value);
        
        if (isNaN(betAmount)) {
            showMessage('لطفا مبلغ شرط را وارد کنید', 'lose-message');
            return;
        }
        
        if (betAmount < 10) {
            showMessage('حداقل مبلغ شرط 10 تومان است', 'lose-message');
            return;
        }
        
        if (betAmount > balance) {
            showMessage('موجودی شما کافی نیست', 'lose-message');
            return;
        }
        
        currentBet = betAmount;
        winAmount = Math.floor(betAmount * 1.5); // 50% سود
        winAmountDisplay.textContent = winAmount;
        
        showMessage(`شرط ${betAmount} تومانی ثبت شد! در صورت برد ${winAmount} تومان دریافت می‌کنید`, 'win-message');
        startBtn.disabled = false;
        placeBetBtn.disabled = true;
    }
    
    // نمایش پیام
    function showMessage(message, className) {
        messageDisplay.textContent = message;
        messageDisplay.className = `message ${className}`;
    }
    
    // به هم ریختن آرایه
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // رویدادهای دکمه‌ها
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    placeBetBtn.addEventListener('click', placeBet);
    
    // اعتبارسنجی ورودی شرط
    betAmountInput.addEventListener('input', () => {
        const value = parseInt(betAmountInput.value);
        if (isNaN(value) || value < 10 || value > balance) {
            placeBetBtn.disabled = true;
        } else {
            placeBetBtn.disabled = false;
        }
    });
});
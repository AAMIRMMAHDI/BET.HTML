document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const coin = document.getElementById('coin');
    const betHeadBtn = document.getElementById('bet-head');
    const betTailBtn = document.getElementById('bet-tail');
    const amountInput = document.getElementById('amount');
    const balanceDisplay = document.getElementById('balance');
    const historyItems = document.getElementById('history-items');
    const message = document.getElementById('message');
    
    // متغیرهای بازی
    let balance = 1000;
    let currentBet = 0;
    let betSide = '';
    let isFlipping = false;
    const history = [];
    
    // رویدادهای کلیک روی دکمه‌های شرط
    betHeadBtn.addEventListener('click', () => placeBet('head'));
    betTailBtn.addEventListener('click', () => placeBet('tail'));
    
    // ثبت شرط
    function placeBet(side) {
        if (isFlipping) return;
        
        const amount = parseInt(amountInput.value);
        
        // اعتبارسنجی
        if (isNaN(amount) || amount < 10) {
            showMessage('لطفا مبلغ شرط را وارد کنید (حداقل 10 تومان)', 'lose-message');
            return;
        }
        
        if (amount > balance) {
            showMessage('موجودی شما کافی نیست', 'lose-message');
            return;
        }
        
        // ثبت شرط
        currentBet = amount;
        betSide = side;
        balance -= amount;
        balanceDisplay.textContent = balance;
        
        // غیرفعال کردن دکمه‌ها در حین بازی
        betHeadBtn.disabled = true;
        betTailBtn.disabled = true;
        amountInput.disabled = true;
        
        // ریست انیمیشن
        coin.style.animation = 'none';
        void coin.offsetWidth; // Trigger reflow
        coin.style.animation = null;
        
        // شروع پرتاب سکه
        flipCoin();
    }
    
    // پرتاب سکه
    function flipCoin() {
        isFlipping = true;
        coin.classList.add('flipping');
        
        // نتیجه تصادفی بعد از انیمیشن
        setTimeout(() => {
            const result = Math.random() < 0.5 ? 'head' : 'tail';
            showResult(result);
        }, 2000);
    }
    
    // نمایش نتیجه
    function showResult(result) {
        // توقف انیمیشن
        coin.classList.remove('flipping');
        
        // تنظیم وضعیت نهایی سکه
        if (result === 'head') {
            coin.style.transform = 'rotateY(0)';
        } else {
            coin.style.transform = 'rotateY(180deg)';
        }
        
        // بررسی برد/باخت
        if (result === betSide) {
            const winAmount = Math.floor(currentBet * 1.95);
            balance += winAmount;
            balanceDisplay.textContent = balance;
            showMessage(`برنده شدید! ${winAmount} تومان به موجودی شما اضافه شد`, 'win-message');
            
            // اضافه کردن به تاریخچه
            addToHistory(result, true);
        } else {
            showMessage(`متاسفانه باختید! ${currentBet} تومان از موجودی کسر شد`, 'lose-message');
            
            // اضافه کردن به تاریخچه
            addToHistory(result === 'head' ? 'tail' : 'head', false);
        }
        
        // فعال کردن دکمه‌ها برای شرط بعدی
        setTimeout(() => {
            betHeadBtn.disabled = false;
            betTailBtn.disabled = false;
            amountInput.disabled = false;
            isFlipping = false;
        }, 1000);
    }
    
    // اضافه کردن به تاریخچه
    function addToHistory(result, isWin) {
        // محدود کردن تاریخچه به 10 آیتم آخر
        if (history.length >= 10) {
            history.shift();
            historyItems.removeChild(historyItems.firstChild);
        }
        
        history.push({ result, isWin });
        
        // ایجاد عنصر جدید در تاریخچه
        const historyItem = document.createElement('div');
        historyItem.className = `history-item history-${result} ${isWin ? 'win' : 'lose'}`;
        historyItem.textContent = result === 'head' ? 'ش' : 'خ';
        
        historyItems.appendChild(historyItem);
    }
    
    // نمایش پیام
    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message ${type}`;
        
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
        
        message.style.display = 'block';
    }
    
    // اعتبارسنجی لحظه‌ای مبلغ شرط
    amountInput.addEventListener('input', () => {
        const amount = parseInt(amountInput.value);
        
        if (amount > balance) {
            amountInput.value = balance;
        }
    });
});
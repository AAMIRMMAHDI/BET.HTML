document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const dice = document.getElementById('dice');
    const rollBtn = document.getElementById('roll-btn');
    const betAmountInput = document.getElementById('bet-amount');
    const numberSelect = document.getElementById('number-select');
    const balanceDisplay = document.getElementById('balance');
    const historyList = document.getElementById('history-list');
    const messageDisplay = document.getElementById('message');
    
    // متغیرهای بازی
    let balance = 1000;
    let currentBet = 0;
    let selectedNumber = 1;
    const multipliers = {1:6, 2:5, 3:4, 4:3, 5:2, 6:1.5};
    
    // رویدادهای کلیک
    rollBtn.addEventListener('click', rollDice);
    numberSelect.addEventListener('change', updateMultiplier);
    
    // پرتاب تاس
    function rollDice() {
        if (dice.classList.contains('rolling')) return;
        
        const betAmount = parseInt(betAmountInput.value);
        selectedNumber = parseInt(numberSelect.value);
        
        // اعتبارسنجی
        if (isNaN(betAmount)) {
            showMessage('لطفا مبلغ شرط را وارد کنید', 'lose');
            return;
        }
        
        if (betAmount < 10) {
            showMessage('حداقل مبلغ شرط 10 تومان است', 'lose');
            return;
        }
        
        if (betAmount > balance) {
            showMessage('موجودی شما کافی نیست', 'lose');
            return;
        }
        
        // کسر مبلغ شرط
        balance -= betAmount;
        currentBet = betAmount;
        updateBalance();
        
        // غیرفعال کردن دکمه در حین پرتاب
        rollBtn.disabled = true;
        
        // انیمیشن پرتاب
        dice.classList.add('rolling');
        
        // تولید عدد تصادفی بعد از انیمیشن
        setTimeout(() => {
            const result = Math.floor(Math.random() * 6) + 1;
            showResult(result);
        }, 2000);
    }
    
    // نمایش نتیجه
    function showResult(result) {
        // توقف انیمیشن
        dice.classList.remove('rolling');
        
        // چرخش تاس به عدد مورد نظر
        const rotation = getRotationForNumber(result);
        dice.style.transform = rotation;
        
        // بررسی برنده شدن
        if (result === selectedNumber) {
            const multiplier = multipliers[selectedNumber];
            const winAmount = Math.floor(currentBet * multiplier);
            balance += winAmount;
            
            showMessage(`برنده شدید! ${winAmount} تومان دریافت کردید`, 'win');
            addToHistory(true, result, winAmount);
        } else {
            showMessage(`متاسفانه باختید! عدد ${result} آمد`, 'lose');
            addToHistory(false, result, currentBet);
        }
        
        updateBalance();
        rollBtn.disabled = false;
    }
    
    // محاسبه چرخش برای عدد مشخص
    function getRotationForNumber(number) {
        const rotations = {
            1: 'rotateX(0) rotateY(0) rotateZ(0)',
            2: 'rotateX(-90deg) rotateY(0) rotateZ(0)',
            3: 'rotateX(0) rotateY(90deg) rotateZ(0)',
            4: 'rotateX(0) rotateY(-90deg) rotateZ(0)',
            5: 'rotateX(90deg) rotateY(0) rotateZ(0)',
            6: 'rotateX(180deg) rotateY(0) rotateZ(0)'
        };
        return rotations[number];
    }
    
    // به‌روزرسانی ضرایب
    function updateMultiplier() {
        const selected = numberSelect.value;
        const multiplier = multipliers[selected];
        const options = numberSelect.querySelectorAll('option');
        options.forEach(opt => {
            opt.textContent = `${opt.value} (${multipliers[opt.value]}x)`;
        });
    }
    
    // اضافه کردن به تاریخچه
    function addToHistory(isWin, result, amount) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${isWin ? 'win' : 'lose'}`;
        historyItem.textContent = result;
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
    
    // مقداردهی اولیه
    updateMultiplier();
});
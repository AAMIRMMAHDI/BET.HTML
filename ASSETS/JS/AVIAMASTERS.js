document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------
    // تنظیمات اصلی بازی
    // ----------------------------
    const config = {
        initialBalance: 5000,
        minBet: 100,
        maxBet: 10000,
        baseCrashChance: 0.003,
        maxMultiplier: 100,
        speedFactors: {
            slow: 0.7,
            normal: 1.0,
            fast: 1.3
        },
        planeSpeed: 1.5,
        turbulenceIntensity: 0.8
    };

    // ----------------------------
    // عناصر DOM
    // ----------------------------
    const elements = {
        balance: document.getElementById('balance'),
        betAmount: document.getElementById('bet-amount'),
        betBtn: document.getElementById('place-bet'),
        cashOutBtn: document.getElementById('cash-out'),
        currentCashout: document.getElementById('current-cashout'),
        autoCashout: document.getElementById('auto-cashout'),
        autoCashoutValue: document.getElementById('auto-cashout-value'),
        autoBtn: document.getElementById('auto-btn'),
        multiplier: document.getElementById('multiplier'),
        multipliersList: document.getElementById('multipliers-list'),
        plane: document.getElementById('plane'),
        shadow: document.querySelector('.shadow'),
        historyPoints: document.querySelector('.history-points'),
        skyBackground: document.querySelector('.sky-background'),
        clouds: document.querySelector('.clouds')
    };

    // ----------------------------
    // صداهای بازی
    // ----------------------------
    const sounds = {
        engine: document.getElementById('engine-sound'),
        takeoff: document.getElementById('takeoff-sound'),
        crash: document.getElementById('crash-sound'),
        win: document.getElementById('win-sound'),
        cashout: document.getElementById('cashout-sound'),
        wind: document.getElementById('wind-sound'),
        turbulence: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-strong-wind-weather-loop-1254.mp3')
    };

    // تنظیمات صدا
    Object.values(sounds).forEach(sound => {
        if (sound) {
            sound.volume = 0.4;
            sound.preload = 'auto';
        }
    });
    sounds.wind.loop = true;
    sounds.turbulence.loop = true;

    // ----------------------------
    // حالت بازی
    // ----------------------------
    const state = {
        balance: config.initialBalance,
        currentBet: 0,
        currentMultiplier: 1.0,
        cashoutMultiplier: 2.0,
        isGameRunning: false,
        isAutoMode: false,
        gameSpeed: 'normal',
        crashPoint: null,
        history: [],
        planePosition: { x: 0, y: 0, z: 0 },
        planeVelocity: { x: 0, y: 0 },
        planeRotation: 0,
        turbulence: 0,
        gamePhase: 'waiting', // waiting, takeoff, flying, crashing, landing
        lastUpdateTime: 0,
        animationFrameId: null
    };

    // ----------------------------
    // توابع اصلی بازی
    // ----------------------------

    // مقداردهی اولیه بازی
    function init() {
        loadHistory();
        setupEventListeners();
        updateBalance();
        updateAutoCashout();
        startAmbientSounds();
        requestAnimationFrame(gameLoop);
    }

    // حلقه اصلی بازی
    function gameLoop(timestamp) {
        if (!state.lastUpdateTime) state.lastUpdateTime = timestamp;
        const deltaTime = (timestamp - state.lastUpdateTime) / 1000;
        state.lastUpdateTime = timestamp;

        if (state.isGameRunning) {
            updateGame(deltaTime);
        }

        state.animationFrameId = requestAnimationFrame(gameLoop);
    }

    // تنظیم رویدادها
    function setupEventListeners() {
        // دکمه‌های مقدار شرط
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.betAmount.value = btn.dataset.amount;
            });
        });
        
        // دکمه شروع شرط
        elements.betBtn.addEventListener('click', placeBet);
        
        // دکمه دریافت سود
        elements.cashOutBtn.addEventListener('click', cashOut);
        
        // اسلایدر دریافت خودکار
        elements.autoCashout.addEventListener('input', updateAutoCashout);
        
        // دکمه فعال‌سازی خودکار
        elements.autoBtn.addEventListener('click', toggleAutoMode);
        
        // تغییر مبلغ شرط
        elements.betAmount.addEventListener('input', validateBetAmount);
        
        // تغییر سرعت بازی
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setGameSpeed(btn.dataset.speed);
            });
        });
        
        // رویدادهای صفحه کلید
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && state.isGameRunning) {
                cashOut();
            }
        });
    }

    // شروع صداهای محیطی
    function startAmbientSounds() {
        sounds.wind.play().catch(e => console.log("Auto-play prevented:", e));
    }

    // بارگیری تاریخچه
    function loadHistory() {
        // اگر تاریخچه خالی است، نمونه‌های تصادفی ایجاد کنید
        if (state.history.length === 0) {
            for (let i = 0; i < 10; i++) {
                state.history.push(generateRealisticMultiplier());
            }
        }
        updateHistoryDisplay();
    }

    // تولید ضریب واقع‌گرایانه
    function generateRealisticMultiplier() {
        // توزیع احتمال برای ضرایب مختلف
        const rand = Math.random();
        if (rand < 0.6) return 1 + Math.random() * 2; // 60% شانس برای ضرایب 1-3x
        if (rand < 0.85) return 1 + Math.random() * 5; // 25% شانس برای ضرایب 1-6x
        if (rand < 0.95) return 1 + Math.random() * 10; // 10% شانس برای ضرایب 1-11x
        return 1 + Math.random() * 50; // 5% شانس برای ضرایب بالا
    }

    // ثبت شرط
    function placeBet() {
        const betAmount = parseInt(elements.betAmount.value);
        
        // اعتبارسنجی
        if (isNaN(betAmount) || betAmount < config.minBet) {
            showMessage(`حداقل مبلغ شرط ${config.minBet.toLocaleString()} تومان است`, 'error');
            return;
        }
        
        if (betAmount > state.balance) {
            showMessage('موجودی شما کافی نیست', 'error');
            return;
        }
        
        if (state.isGameRunning) return;
        
        // تنظیم حالت بازی
        state.currentBet = betAmount;
        state.balance -= betAmount;
        state.currentMultiplier = 1.0;
        state.isGameRunning = true;
        state.gamePhase = 'takeoff';
        state.crashPoint = calculateCrashPoint();
        state.planePosition = { x: 0, y: 0, z: 0 };
        state.planeVelocity = { x: 0, y: 0 };
        state.planeRotation = 0;
        state.turbulence = 0;
        
        updateBalance();
        updateUI();
        
        // پخش صداها
        playSound(sounds.takeoff);
        playSound(sounds.engine);
        sounds.engine.volume = 0.3;
        
        // شروع انیمیشن پرواز
        startTakeoffAnimation();
    }

    // محاسبه نقطه سقوط با الگوریتم پیشرفته
    function calculateCrashPoint() {
        const base = 1.0;
        const volatility = 0.5 + Math.random() * 1.5; // میزان نوسان
        
        // محاسبه با توزیع نمایی
        let crashMultiplier = base + (-Math.log(1 - Math.random()) * volatility);
        
        // محدود کردن به حداکثر ضریب
        crashMultiplier = Math.min(crashMultiplier, config.maxMultiplier);
        
        // گرد کردن به دو رقم اعشار
        return parseFloat(crashMultiplier.toFixed(2));
    }

    // انیمیشن برخاستن هواپیما
    function startTakeoffAnimation() {
        gsap.to(state.planePosition, {
            y: -30,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: updatePlaneVisuals
        });
        
        gsap.to(state, {
            planeRotation: 5,
            duration: 1,
            ease: "sine.inOut",
            onUpdate: updatePlaneVisuals
        });
        
        // تغییر پس‌زمینه بر اساس زمان روز
        setTimeOfDay();
    }

    // به‌روزرسانی بازی
    function updateGame(deltaTime) {
        // محاسبه افزایش ضریب
        const speedFactor = config.speedFactors[state.gameSpeed] || 1.0;
        const baseIncrement = 0.02 * speedFactor;
        
        // محاسبه نوسانات بر اساس تلاطم
        const turbulenceEffect = state.turbulence * 0.02;
        const randomFactor = 1 + (Math.random() - 0.5) * turbulenceEffect;
        
        // افزایش ضریب
        const multiplierIncrement = baseIncrement * randomFactor * deltaTime * 60;
        state.currentMultiplier += multiplierIncrement;
        
        // به‌روزرسانی تلاطم
        updateTurbulence(deltaTime);
        
        // به‌روزرسانی نمایش
        updateMultiplierDisplay();
        updatePlanePhysics(deltaTime);
        updatePlaneVisuals();
        
        // بررسی شرایط پایان بازی
        checkGameEndConditions();
    }

    // به‌روزرسانی فیزیک هواپیما
    function updatePlanePhysics(deltaTime) {
        const progress = Math.min(1, Math.log(state.currentMultiplier) / Math.log(state.crashPoint));
        
        // محاسبه سرعت هواپیما
        const targetVelocityX = progress * config.planeSpeed * window.innerWidth;
        state.planeVelocity.x += (targetVelocityX - state.planeVelocity.x) * 0.1 * deltaTime * 60;
        
        // محاسبه موقعیت X
        state.planePosition.x = state.planeVelocity.x;
        
        // محاسبه نوسانات عمودی (تلاطم)
        const turbulenceY = Math.sin(Date.now() * 0.003) * state.turbulence * 15;
        const targetY = -30 + turbulenceY;
        state.planePosition.y += (targetY - state.planePosition.y) * 0.1 * deltaTime * 60;
        
        // محاسبه چرخش هواپیما
        const targetRotation = turbulenceY * 0.3;
        state.planeRotation += (targetRotation - state.planeRotation) * 0.05 * deltaTime * 60;
    }

    // به‌روزرسانی تلاطم
    function updateTurbulence(deltaTime) {
        // افزایش تدریجی تلاطم با افزایش ضریب
        const baseTurbulence = Math.min(1, (state.currentMultiplier - 1) / 10);
        
        // نوسانات تصادفی
        const randomTurbulence = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
        
        // محاسبه تلاطم نهایی
        state.turbulence = baseTurbulence * randomTurbulence * config.turbulenceIntensity;
        
        // تنظیم صداهای تلاطم
        sounds.turbulence.volume = state.turbulence * 0.3;
        if (state.turbulence > 0.2 && !sounds.turbulence.paused) {
            playSound(sounds.turbulence);
        } else {
            sounds.turbulence.pause();
        }
    }

    // بررسی شرایط پایان بازی
    function checkGameEndConditions() {
        // بررسی دریافت خودکار
        if (state.isAutoMode && state.currentMultiplier >= state.cashoutMultiplier) {
            cashOut();
            return;
        }
        
        // بررسی سقوط
        if (state.currentMultiplier >= state.crashPoint) {
            endGame('crash');
            return;
        }
        
        // تغییر فاز بازی
        if (state.gamePhase === 'takeoff' && state.currentMultiplier > 1.1) {
            state.gamePhase = 'flying';
        }
    }

    // دریافت سود
    function cashOut() {
        if (!state.isGameRunning) return;
        
        const winAmount = Math.floor(state.currentBet * state.currentMultiplier);
        state.balance += winAmount;
        
        endGame('cashout');
        showMessage(`سود شما: ${winAmount.toLocaleString()} تومان (${state.currentMultiplier.toFixed(2)}x)`, 'success');
        playSound(sounds.cashout);
    }

    // پایان بازی
    function endGame(result) {
        state.isGameRunning = false;
        state.gamePhase = result === 'cashout' ? 'landing' : 'crashing';
        
        // پخش صداها
        sounds.engine.pause();
        sounds.turbulence.pause();
        
        if (result === 'cashout') {
            playSound(sounds.win);
            animateLanding();
        } else {
            playSound(sounds.crash);
            animateCrash();
        }
        
        // به‌روزرسانی تاریخچه
        addToHistory(state.currentMultiplier);
        updateBalance();
        updateUI();
    }

    // انیمیشن فرود
    function animateLanding() {
        gsap.to(state.planePosition, {
            x: window.innerWidth + 200,
            y: 50,
            duration: 2,
            ease: "power2.in",
            onUpdate: updatePlaneVisuals,
            onComplete: resetPlane
        });
        
        gsap.to(state, {
            planeRotation: 10,
            duration: 1,
            ease: "sine.inOut",
            onUpdate: updatePlaneVisuals
        });
    }

    // انیمیشن سقوط
    function animateCrash() {
        gsap.to(state.planePosition, {
            y: 200,
            duration: 1.5,
            ease: "power1.in",
            onUpdate: updatePlaneVisuals
        });
        
        gsap.to(state, {
            planeRotation: 90,
            duration: 0.8,
            ease: "power1.in",
            onUpdate: updatePlaneVisuals,
            onComplete: resetPlane
        });
    }

    // بازنشانی هواپیما
    function resetPlane() {
        state.planePosition = { x: 0, y: 0, z: 0 };
        state.planeRotation = 0;
        updatePlaneVisuals();
    }

    // ----------------------------
    // توابع نمایشی
    // ----------------------------

    // به‌روزرسانی نمایش ضریب
    function updateMultiplierDisplay() {
        const multiplier = state.currentMultiplier;
        elements.multiplier.textContent = multiplier.toFixed(2);
        elements.currentCashout.textContent = multiplier.toFixed(2);
        
        // تغییر رنگ بر اساس ضریب
        let color;
        if (multiplier < 1.5) color = '#ef4444'; // قرمز
        else if (multiplier < 3) color = '#f59e0b'; // نارنجی
        else if (multiplier < 5) color = '#eab308'; // زرد
        else color = '#22c55e'; // سبز
        
        elements.multiplier.style.color = color;
        elements.currentCashout.style.color = color;
        
        // انیمیشن پالس برای ضرایب بالا
        if (multiplier > 5) {
            elements.multiplier.classList.add('animate-pulse');
        } else {
            elements.multiplier.classList.remove('animate-pulse');
        }
    }

    // به‌روزرسانی نمایش هواپیما
    function updatePlaneVisuals() {
        // اعمال موقعیت و چرخش
        gsap.set(elements.plane, {
            x: state.planePosition.x,
            y: state.planePosition.y,
            rotation: state.planeRotation,
            zIndex: 10 + Math.floor(state.planePosition.z)
        });
        
        // به‌روزرسانی سایه
        updatePlaneShadow();
    }

    // به‌روزرسانی سایه هواپیما
    function updatePlaneShadow() {
        const shadowX = state.planePosition.x + 15;
        const shadowY = state.planePosition.y + 40;
        const shadowScale = 0.8 + (state.currentMultiplier * 0.01);
        const shadowAlpha = 0.2 + (state.turbulence * 0.1);
        
        gsap.set(elements.shadow, {
            x: shadowX,
            y: shadowY,
            scaleX: shadowScale,
            opacity: Math.min(0.5, shadowAlpha)
        });
    }

    // تنظیم زمان روز
    function setTimeOfDay() {
        const timeTypes = ['day', 'sunset', 'night'];
        const time = timeTypes[Math.floor(Math.random() * timeTypes.length)];
        
        elements.skyBackground.className = 'sky-background';
        elements.clouds.className = 'clouds';
        
        switch(time) {
            case 'sunset':
                elements.skyBackground.classList.add('sunset');
                elements.clouds.classList.add('sunset-clouds');
                break;
            case 'night':
                elements.skyBackground.classList.add('night');
                elements.clouds.classList.add('night-clouds');
                break;
            default:
                elements.skyBackground.classList.add('day');
                elements.clouds.classList.add('day-clouds');
        }
    }

    // ----------------------------
    // توابع کمکی
    // ----------------------------

    // اعتبارسنجی مبلغ شرط
    function validateBetAmount() {
        let value = parseInt(elements.betAmount.value);
        if (isNaN(value)) value = config.minBet;
        value = Math.max(config.minBet, Math.min(config.maxBet, value));
        elements.betAmount.value = value;
    }

    // تنظیم دریافت خودکار
    function updateAutoCashout() {
        state.cashoutMultiplier = parseFloat(elements.autoCashout.value);
        elements.autoCashoutValue.textContent = state.cashoutMultiplier.toFixed(2) + 'x';
    }

    // تغییر حالت خودکار
    function toggleAutoMode() {
        state.isAutoMode = !state.isAutoMode;
        elements.autoBtn.textContent = state.isAutoMode ? 'غیرفعال کردن خودکار' : 'فعال‌سازی اتوماتیک';
        elements.autoBtn.classList.toggle('active', state.isAutoMode);
    }

    // تنظیم سرعت بازی
    function setGameSpeed(speed) {
        state.gameSpeed = speed;
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.speed === speed);
        });
    }

    // افزودن به تاریخچه
    function addToHistory(multiplier) {
        state.history.unshift(multiplier);
        if (state.history.length > 10) {
            state.history.pop();
        }
        updateHistoryDisplay();
    }

    // به‌روزرسانی نمایش تاریخچه
    function updateHistoryDisplay() {
        elements.multipliersList.innerHTML = '';
        
        state.history.forEach((mult, index) => {
            const item = document.createElement('div');
            item.className = 'round-item';
            item.textContent = mult.toFixed(2) + 'x';
            
            // رنگ‌بندی بر اساس ضریب
            if (mult < 1.5) {
                item.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                item.style.color = '#ef4444';
            } else if (mult < 3) {
                item.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                item.style.color = '#f59e0b';
            } else if (mult < 5) {
                item.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                item.style.color = '#eab308';
            } else {
                item.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                item.style.color = '#22c55e';
            }
            
            elements.multipliersList.appendChild(item);
        });
    }

    // به‌روزرسانی موجودی
    function updateBalance() {
        elements.balance.textContent = state.balance.toLocaleString();
    }

    // به‌روزرسانی UI
    function updateUI() {
        elements.betBtn.disabled = state.isGameRunning;
        elements.cashOutBtn.disabled = !state.isGameRunning;
        elements.betAmount.disabled = state.isGameRunning;
        elements.autoCashout.disabled = state.isGameRunning;
    }

    // پخش صدا
    function playSound(sound) {
        if (!sound) return;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play error:", e));
    }

    // نمایش پیام
    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        
        document.body.appendChild(messageBox);
        
        gsap.fromTo(messageBox, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 }
        );
        
        setTimeout(() => {
            gsap.to(messageBox, {
                y: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => messageBox.remove()
            });
        }, 3000);
    }

    // شروع بازی
    init();
});
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const betBtn = document.getElementById('place-bet');
    const betAmountInput = document.getElementById('bet-amount');
    const difficultySelect = document.getElementById('difficulty');
    const multiplierDisplay = document.getElementById('multiplier');
    const livesDisplay = document.getElementById('lives');
    const balanceDisplay = document.getElementById('balance');
    const moveSound = document.getElementById('move-sound');
    const crashSound = document.getElementById('crash-sound');
    const winSound = document.getElementById('win-sound');

    // Game variables
    let score = 0;
    let lives = 3;
    let gameSpeed = 2;
    let gameInterval;
    let carInterval;
    let isGameRunning = false;
    let level = 1;
    let chickenPosition = { x: 280, y: 360 };
    let cars = [];
    let trucks = [];
    let roads = [];
    
    // Betting variables
    let balance = 1000;
    let currentBet = 0;
    let currentMultiplier = 0.5;
    let difficulty = 'easy';

    // Update difficulty settings
    function updateDifficulty() {
        difficulty = difficultySelect.value;
        switch(difficulty) {
            case 'easy':
                currentMultiplier = 0.5;
                gameSpeed = 2;
                break;
            case 'medium':
                currentMultiplier = 1.5;
                gameSpeed = 3;
                break;
            case 'hard':
                currentMultiplier = 2;
                gameSpeed = 4;
                break;
            case 'extreme':
                currentMultiplier = 3;
                gameSpeed = 5;
                break;
        }
        multiplierDisplay.textContent = currentMultiplier;
    }

    // Place bet
    function placeBet() {
        const betAmount = parseInt(betAmountInput.value);
        
        if (isNaN(betAmount)) {
            alert('لطفا مبلغ شرط را وارد کنید');
            return;
        }
        
        if (betAmount < 10) {
            alert('حداقل مبلغ شرط 10 تومان است');
            return;
        }
        
        if (betAmount > balance) {
            alert('موجودی شما کافی نیست');
            return;
        }
        
        currentBet = betAmount;
        balance -= betAmount;
        balanceDisplay.textContent = balance;
        
        updateDifficulty();
        
        betBtn.disabled = true;
        betAmountInput.disabled = true;
        difficultySelect.disabled = true;
        startBtn.disabled = false;
        
        alert(`شرط ${betAmount} تومان با ضریب ${currentMultiplier} ثبت شد!`);
    }

    // Initialize game board
    function initGameBoard() {
        // Create roads
        for (let i = 0; i < 4; i++) {
            const road = document.createElement('div');
            road.className = 'road';
            road.style.top = `${100 + (i * 80)}px`;
            gameBoard.appendChild(road);
            roads.push(road);
        }

        // Create chicken
        const chicken = document.createElement('div');
        chicken.className = 'chicken';
        chicken.style.left = `${chickenPosition.x}px`;
        chicken.style.top = `${chickenPosition.y}px`;
        gameBoard.appendChild(chicken);
    }

    // Start game
    function startGame() {
        if (isGameRunning) return;
        
        isGameRunning = true;
        score = 0;
        lives = 3;
        level = 1;
        chickenPosition = { x: 280, y: 360 };
        
        updateLives();
        
        // Clear existing vehicles
        document.querySelectorAll('.car, .truck').forEach(el => el.remove());
        cars = [];
        trucks = [];
        
        // Create initial chicken
        const chicken = document.querySelector('.chicken');
        chicken.style.left = `${chickenPosition.x}px`;
        chicken.style.top = `${chickenPosition.y}px`;
        
        // Start game loops
        gameInterval = setInterval(updateGame, 20);
        carInterval = setInterval(createVehicle, 2000 - (gameSpeed * 200));
        
        startBtn.textContent = 'بازی در حال اجرا...';
        startBtn.disabled = true;
    }

    // Create vehicles
    function createVehicle() {
        const roadIndex = Math.floor(Math.random() * roads.length);
        const road = roads[roadIndex];
        const roadTop = parseInt(road.style.top);
        const isCar = Math.random() > 0.3;
        
        if (isCar) {
            const car = document.createElement('div');
            car.className = 'car';
            car.style.top = `${roadTop + 25}px`;
            car.style.left = Math.random() > 0.5 ? '-60px' : '600px';
            gameBoard.appendChild(car);
            
            cars.push({
                element: car,
                x: parseInt(car.style.left),
                y: roadTop + 25,
                direction: car.style.left === '-60px' ? 'right' : 'left',
                speed: Math.random() * 2 + gameSpeed
            });
        } else {
            const truck = document.createElement('div');
            truck.className = 'truck';
            truck.style.top = `${roadTop + 22}px`;
            truck.style.left = Math.random() > 0.5 ? '-80px' : '600px';
            gameBoard.appendChild(truck);
            
            trucks.push({
                element: truck,
                x: parseInt(truck.style.left),
                y: roadTop + 22,
                direction: truck.style.left === '-80px' ? 'right' : 'left',
                speed: Math.random() * 1.5 + gameSpeed
            });
        }
    }

    // Update game state
    function updateGame() {
        moveVehicles();
        checkCollisions();
        checkLevelComplete();
    }

    // Move vehicles
    function moveVehicles() {
        // Move cars
        cars.forEach(car => {
            if (car.direction === 'right') {
                car.x += car.speed;
                car.element.style.left = `${car.x}px`;
                
                if (car.x > 600) {
                    car.element.remove();
                    cars = cars.filter(c => c !== car);
                }
            } else {
                car.x -= car.speed;
                car.element.style.left = `${car.x}px`;
                
                if (car.x < -60) {
                    car.element.remove();
                    cars = cars.filter(c => c !== car);
                }
            }
        });
        
        // Move trucks
        trucks.forEach(truck => {
            if (truck.direction === 'right') {
                truck.x += truck.speed;
                truck.element.style.left = `${truck.x}px`;
                
                if (truck.x > 600) {
                    truck.element.remove();
                    trucks = trucks.filter(t => t !== truck);
                }
            } else {
                truck.x -= truck.speed;
                truck.element.style.left = `${truck.x}px`;
                
                if (truck.x < -80) {
                    truck.element.remove();
                    trucks = trucks.filter(t => t !== truck);
                }
            }
        });
    }

    // Check collisions
    function checkCollisions() {
        const chicken = document.querySelector('.chicken');
        const chickenRect = chicken.getBoundingClientRect();
        
        // Check car collisions
        cars.forEach(car => {
            const carRect = car.element.getBoundingClientRect();
            
            if (
                chickenRect.left < carRect.right &&
                chickenRect.right > carRect.left &&
                chickenRect.top < carRect.bottom &&
                chickenRect.bottom > carRect.top
            ) {
                crashSound.currentTime = 0;
                crashSound.play();
                loseLife();
            }
        });
        
        // Check truck collisions
        trucks.forEach(truck => {
            const truckRect = truck.element.getBoundingClientRect();
            
            if (
                chickenRect.left < truckRect.right &&
                chickenRect.right > truckRect.left &&
                chickenRect.top < truckRect.bottom &&
                chickenRect.bottom > truckRect.top
            ) {
                crashSound.currentTime = 0;
                crashSound.play();
                loseLife();
            }
        });
    }

    // Check if level is complete
    function checkLevelComplete() {
        if (chickenPosition.y <= 20) {
            winSound.currentTime = 0;
            winSound.play();
            levelComplete();
        }
    }

    // Level complete
    function levelComplete() {
        clearInterval(gameInterval);
        clearInterval(carInterval);
        isGameRunning = false;
        
        const winAmount = Math.floor(currentBet * currentMultiplier);
        balance += winAmount;
        balanceDisplay.textContent = balance;
        
        const levelCompleteDiv = document.createElement('div');
        levelCompleteDiv.className = 'level-complete';
        levelCompleteDiv.innerHTML = `
            <h2>تبریک! شما برنده شدید!</h2>
            <p>مبلغ ${winAmount} تومان به حساب شما اضافه شد</p>
            <p>موجودی جدید: ${balance} تومان</p>
            <button id="next-level">بازی مجدد</button>
        `;
        gameBoard.appendChild(levelCompleteDiv);
        
        document.getElementById('next-level').addEventListener('click', () => {
            levelCompleteDiv.remove();
            resetBetControls();
        });
    }

    // Lose life
    function loseLife() {
        lives--;
        updateLives();
        
        if (lives <= 0) {
            gameOver();
        } else {
            chickenPosition = { x: 280, y: 360 };
        }
    }

    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        clearInterval(carInterval);
        isGameRunning = false;
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>بازی تمام شد!</h2>
            <p>شما ${currentBet} تومان را از دست دادید</p>
            <p>موجودی شما: ${balance} تومان</p>
            <button id="restart">بازی مجدد</button>
        `;
        gameBoard.appendChild(gameOverDiv);
        
        document.getElementById('restart').addEventListener('click', () => {
            gameOverDiv.remove();
            resetBetControls();
        });
    }

    // Reset bet controls
    function resetBetControls() {
        betBtn.disabled = false;
        betAmountInput.disabled = false;
        difficultySelect.disabled = false;
        startBtn.textContent = 'شروع بازی';
        startBtn.disabled = true;
    }

    // Update lives display
    function updateLives() {
        livesDisplay.textContent = lives;
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        
        moveSound.currentTime = 0;
        moveSound.play();
        
        switch (e.key) {
            case 'ArrowUp':
                if (chickenPosition.y > 0) chickenPosition.y -= 40;
                break;
            case 'ArrowDown':
                if (chickenPosition.y < 360) chickenPosition.y += 40;
                break;
            case 'ArrowLeft':
                if (chickenPosition.x > 0) chickenPosition.x -= 40;
                break;
            case 'ArrowRight':
                if (chickenPosition.x < 560) chickenPosition.x += 40;
                break;
        }
        
        // Update chicken position
        const chicken = document.querySelector('.chicken');
        chicken.style.left = `${chickenPosition.x}px`;
        chicken.style.top = `${chickenPosition.y}px`;
    });

    // Event listeners
    difficultySelect.addEventListener('change', updateDifficulty);
    betBtn.addEventListener('click', placeBet);
    startBtn.addEventListener('click', startGame);

    // Initialize game
    updateDifficulty();
    initGameBoard();
});
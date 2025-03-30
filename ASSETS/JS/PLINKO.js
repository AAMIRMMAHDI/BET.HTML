

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





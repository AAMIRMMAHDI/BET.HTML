const attackBtn = document.getElementById("attack-btn");
const defendBtn = document.getElementById("defend-btn");
const log = document.getElementById("log");
const playerHealth = document.querySelector(".player .health");
const enemyHealth = document.querySelector(".enemy .health");

let playerHP = 100;
let enemyHP = 100;

function updateHealthBars() {
    playerHealth.style.width = `${playerHP}%`;
    enemyHealth.style.width = `${enemyHP}%`;
    
    if (playerHP <= 0) {
        log.innerHTML += "<p>You lost! ☠️</p>";
        disableButtons();
    } else if (enemyHP <= 0) {
        log.innerHTML += "<p>You won! 🎉</p>";
        disableButtons();
    }
}

function disableButtons() {
    attackBtn.disabled = true;
    defendBtn.disabled = true;
}

attackBtn.addEventListener("click", () => {
    const damage = Math.floor(Math.random() * 20) + 10;
    enemyHP -= damage;
    if (enemyHP < 0) enemyHP = 0;
    
    log.innerHTML += `<p>You attacked for ${damage} damage! ⚔️</p>`;
    
    // Enemy counter-attack
    setTimeout(() => {
        const enemyDamage = Math.floor(Math.random() * 15) + 5;
        playerHP -= enemyDamage;
        if (playerHP < 0) playerHP = 0;
        
        log.innerHTML += `<p>Enemy hit you for ${enemyDamage} damage! 💢</p>`;
        updateHealthBars();
    }, 500);
    
    updateHealthBars();
});

defendBtn.addEventListener("click", () => {
    const enemyDamage = Math.floor(Math.random() * 10) + 5;
    playerHP -= enemyDamage / 2; // نصف آسیب با دفاع
    if (playerHP < 0) playerHP = 0;
    
    log.innerHTML += `<p>You defended! Enemy hit you for ${enemyDamage / 2} damage! 🛡️</p>`;
    updateHealthBars();
});
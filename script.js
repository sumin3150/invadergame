// Game constants
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

// Platform configuration
const platform = {
    x: 0,
    y: canvas.height - 20,
    width: canvas.width,
    height: 20
};

// Game state
let isGameRunning = false;
let score = 0;
let lives = 3;
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 20,
    speed: 5
};

// Player bullets array
let bullets = []; 
const alienRows = 3;
const alienCols = 5;
const alienWidth = 20;
const alienHeight = 20;
const alienSpeed = 2;
const DESCENT_INTERVAL = 5000; // ms
const ROW_DROP = 20; // px
let descentTimer = 0; // 累積時間
let aliens = [];
let alienDirection = 1;
let lastMoveTime = 0; // Track the last time aliens moved

// Initialize aliens
function initAliens() {
    aliens = [];
    for (let row = 0; row < alienRows; row++) {
        for (let col = 0; col < alienCols; col++) {
            aliens.push({
                x: col * (alienWidth + 10) + 50,
                y: row * (alienHeight + 10) + 50,
                width: alienWidth,
                height: alienHeight
            });
        }
    }
}

// Game loop
function gameLoop() {
    if (!isGameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw platform
    ctx.fillStyle = 'white';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Draw player
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= 5;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
        ctx.fillRect(bullet.x, bullet.y, 2, 10);
    });
    
    // Draw aliens and handle movement
    let moveDown = false;
    aliens.forEach((alien, index) => {
        // Check collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + 2 > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + 10 > alien.y) {
                aliens.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });
        
        // Draw alien
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        
        // Check if aliens need to move down
        if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
            moveDown = true;
        }
    });
    
    // Move aliens horizontally
    aliens.forEach(alien => alien.x += alienDirection * alienSpeed);
    
    // Check if aliens hit the edge
    aliens.forEach(alien => {
        if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
            alienDirection *= -1;
            return false; // Exit early since we only need to change direction once
        }
    });
    
    // Update descent timer and drop aliens
    descentTimer += 16; // Approximate frame time in ms
    if (descentTimer >= DESCENT_INTERVAL) {
        aliens.forEach(alien => alien.y += ROW_DROP);
        descentTimer -= DESCENT_INTERVAL;
    }
    
    // Check game over conditions
    if (aliens.length === 0) {
        ctx.fillStyle = 'white';
        ctx.font = '30px monospace';
        ctx.fillText('You Win!', canvas.width / 2 - 60, canvas.height / 2);
        isGameRunning = false;
    }
    
    // Check if aliens have reached the bottom
    aliens.forEach(alien => {
        if (alien.y + alien.height >= player.y) {
            lives--;
            livesDisplay.textContent = `Lives: ${lives}`;
            if (lives <= 0) {
                ctx.fillStyle = 'white';
                ctx.font = '30px monospace';
                ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2);
                isGameRunning = false;
            }
        }
    });
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isGameRunning) {
        score = 0;
        lives = 3;
        scoreDisplay.textContent = 'Score: 0';
        livesDisplay.textContent = 'Lives: 3';
        player.x = canvas.width / 2 - 20;
        initAliens();
        bullets = [];
        descentTimer = 0; // Reset descent timer
        isGameRunning = true;
        gameLoop();
    }
});

document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (e.key === ' ' && bullets.length === 0) {
        // Check if player is on platform
        if (player.y + player.height === platform.y) {
            bullets.push({
                x: player.x + player.width / 2 - 1,
                y: platform.y - 1
            });
        } else {
            bullets.push({
                x: player.x + player.width / 2 - 1,
                y: player.y
            });
        }
    }
});

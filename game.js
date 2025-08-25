const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

let gameState = 'loading'; // 'loading', 'playing' or 'gameOver'
let score = 0;
let animationId;

const enemyImage = new Image();
const heroImage = new Image();
enemyImage.src = 'enemy.png';
heroImage.src = 'hero.png';
let imagesLoaded = 0;
const totalImages = 2;

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded >= totalImages) {
        gameState = 'playing';
        gameLoop();
    }
}

enemyImage.onload = checkAllImagesLoaded;
heroImage.onload = checkAllImagesLoaded;

const player = {
    x: canvas.width / 2 - 22.5,
    y: canvas.height - 50,
    width: 45,
    height: 45,
    speed: 5
};

const bullets = [];
const enemies = [];
let lastEnemySpawn = 0;

const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};

document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
            keys.right = true;
            e.preventDefault();
            break;
        case 'ArrowUp':
            keys.up = true;
            e.preventDefault();
            break;
        case 'ArrowDown':
            keys.down = true;
            e.preventDefault();
            break;
        case 'Space':
            keys.space = true;
            e.preventDefault();
            break;
        case 'KeyR':
            if (gameState === 'gameOver') {
                restartGame();
            }
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            break;
        case 'Space':
            keys.space = false;
            break;
    }
});

// Touch controls
function addTouchControls() {
    const upBtn = document.getElementById('upBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');
    const shootBtn = document.getElementById('shootBtn');

    // Movement buttons
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.up = true;
        upBtn.classList.add('active');
    });
    upBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.up = false;
        upBtn.classList.remove('active');
    });

    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.left = true;
        leftBtn.classList.add('active');
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.left = false;
        leftBtn.classList.remove('active');
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.right = true;
        rightBtn.classList.add('active');
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.right = false;
        rightBtn.classList.remove('active');
    });

    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.down = true;
        downBtn.classList.add('active');
    });
    downBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.down = false;
        downBtn.classList.remove('active');
    });

    // Shoot button
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.space = true;
        shootBtn.classList.add('active');
    });
    shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.space = false;
        shootBtn.classList.remove('active');
    });

    // Also handle mouse events for testing on desktop
    [upBtn, leftBtn, rightBtn, downBtn, shootBtn].forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.dispatchEvent(new Event('touchstart'));
        });
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            btn.dispatchEvent(new Event('touchend'));
        });
    });
}

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.up && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.down && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

let lastBulletTime = 0;
function updateBullets() {
    const currentTime = Date.now();
    
    if (keys.space && currentTime - lastBulletTime > 150) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        lastBulletTime = currentTime;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    const currentTime = Date.now();
    
    if (currentTime - lastEnemySpawn > 1000) {
        enemies.push({
            x: Math.random() * (canvas.width - 45),
            y: -45,
            width: 45,
            height: 45,
            speed: 2 + Math.random() * 2
        });
        lastEnemySpawn = currentTime;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                scoreElement.textContent = `スコア: ${score}`;
                break;
            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y) {
            
            gameState = 'gameOver';
            gameOverElement.style.display = 'block';
            break;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imagesLoaded >= totalImages) {
        ctx.drawImage(heroImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    if (imagesLoaded >= totalImages) {
        enemies.forEach(enemy => {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        });
    } else {
        ctx.fillStyle = '#ff0000';
        enemies.forEach(enemy => {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
}

function gameLoop() {
    if (gameState === 'playing') {
        updatePlayer();
        updateBullets();
        updateEnemies();
        checkCollisions();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
}

function restartGame() {
    gameState = 'playing';
    score = 0;
    scoreElement.textContent = `スコア: ${score}`;
    gameOverElement.style.display = 'none';
    
    player.x = canvas.width / 2 - 22.5;
    player.y = canvas.height - 50;
    
    bullets.length = 0;
    enemies.length = 0;
    
    lastEnemySpawn = Date.now();
    lastBulletTime = 0;
    
    gameLoop();
}

// Initialize game
addTouchControls();

if (imagesLoaded >= totalImages) {
    gameState = 'playing';
    gameLoop();
}

// Prevent scrolling on mobile when touching game area
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
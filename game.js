// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.3;
const JUMP_POWER = -6;
const OBSTACLE_SPEED = 1.5;
const OBSTACLE_SPAWN_RATE = 180;
const OBSTACLE_GAP = 150;
const OBSTACLE_WIDTH = 60;

// Colors (Kiro brand colors)
const COLORS = {
    purple: '#790ECB',
    purpleLight: '#9D4EDB',
    background: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#a0a0a0'
};

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let frameCount = 0;

// Player (Kiro character)
const player = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    image: new Image()
};

// Load Kiro logo
player.image.src = 'kiro-logo.png';

// Obstacles array
let obstacles = [];

// Input handling
function handleInput(e) {
    if (e.code === 'Space' || e.type === 'click') {
        e.preventDefault();
        
        if (gameState === 'start') {
            gameState = 'playing';
            resetGame();
        } else if (gameState === 'playing') {
            player.velocity = JUMP_POWER;
        } else if (gameState === 'gameOver') {
            gameState = 'start';
        }
    }
}

document.addEventListener('keydown', handleInput);
canvas.addEventListener('click', handleInput);

// Reset game
function resetGame() {
    player.y = canvas.height / 2;
    player.velocity = 0;
    obstacles = [];
    score = 0;
    frameCount = 0;
}

// Create obstacle
function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - OBSTACLE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    obstacles.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + OBSTACLE_GAP,
        scored: false
    });
}

// Update game logic
function update() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    
    // Update player
    player.velocity += GRAVITY;
    player.y += player.velocity;
    
    // Spawn obstacles
    if (frameCount % OBSTACLE_SPAWN_RATE === 0) {
        createObstacle();
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= OBSTACLE_SPEED;
        
        // Score when passing obstacle
        if (!obstacle.scored && obstacle.x + OBSTACLE_WIDTH < player.x) {
            obstacle.scored = true;
            score++;
        }
        
        // Remove off-screen obstacles
        if (obstacle.x + OBSTACLE_WIDTH < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    // Check collisions
    checkCollisions();
}

// Check collisions
function checkCollisions() {
    // Ground and ceiling collision
    if (player.y + player.height > canvas.height || player.y < 0) {
        gameState = 'gameOver';
        return;
    }
    
    // Obstacle collision
    for (const obstacle of obstacles) {
        if (player.x + player.width > obstacle.x && 
            player.x < obstacle.x + OBSTACLE_WIDTH) {
            
            // Check if hit top or bottom pipe
            if (player.y < obstacle.topHeight || 
                player.y + player.height > obstacle.bottomY) {
                gameState = 'gameOver';
                return;
            }
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas with background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        drawGame();
    } else if (gameState === 'gameOver') {
        drawGame();
        drawGameOverScreen();
    }
}

// Draw start screen
function drawStartScreen() {
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Kiro', canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('Press SPACE or click to start!', canvas.width / 2, canvas.height / 2 + 20);
    
    // Draw Kiro logo preview
    if (player.image.complete) {
        ctx.drawImage(player.image, 
            canvas.width / 2 - player.width / 2, 
            canvas.height / 2 - 20, 
            player.width, 
            player.height);
    }
}

// Draw game
function drawGame() {
    // Draw obstacles
    ctx.fillStyle = COLORS.purple;
    for (const obstacle of obstacles) {
        // Top pipe
        ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, obstacle.topHeight);
        
        // Bottom pipe
        ctx.fillRect(obstacle.x, obstacle.bottomY, OBSTACLE_WIDTH, 
            canvas.height - obstacle.bottomY);
        
        // Pipe caps (lighter purple)
        ctx.fillStyle = COLORS.purpleLight;
        ctx.fillRect(obstacle.x - 5, obstacle.topHeight - 20, OBSTACLE_WIDTH + 10, 20);
        ctx.fillRect(obstacle.x - 5, obstacle.bottomY, OBSTACLE_WIDTH + 10, 20);
        ctx.fillStyle = COLORS.purple;
    }
    
    // Draw player
    if (player.image.complete) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        
        // Rotate based on velocity for visual feedback
        const rotation = Math.min(Math.max(player.velocity * 0.05, -0.5), 0.5);
        ctx.rotate(rotation);
        
        ctx.drawImage(player.image, -player.width / 2, -player.height / 2, 
            player.width, player.height);
        ctx.restore();
    }
    
    // Draw score
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 50);
}

// Draw game over screen
function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '28px sans-serif';
    ctx.fillStyle = COLORS.purple;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('Press SPACE or click to restart', canvas.width / 2, canvas.height / 2 + 80);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

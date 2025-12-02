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

// Storage Manager
const StorageManager = {
    STORAGE_KEY: 'flappyKiroHighScore',
    
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Local storage is not available:', e);
            return false;
        }
    },
    
    loadHighScore() {
        if (!this.isStorageAvailable()) {
            return 0;
        }
        
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? parseInt(stored, 10) : 0;
        } catch (e) {
            console.warn('Failed to load high score:', e);
            return 0;
        }
    },
    
    saveHighScore(score) {
        if (!this.isStorageAvailable()) {
            return;
        }
        
        try {
            localStorage.setItem(this.STORAGE_KEY, score.toString());
        } catch (e) {
            console.warn('Failed to save high score:', e);
        }
    }
};

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let highScore = StorageManager.loadHighScore();
let lastHighScore = highScore; // Track previous high score to detect new records
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

// Particle System
const ParticleSystem = {
    trailParticles: [],
    explosionParticles: [],
    sparkleParticles: [],
    confettiParticles: [],
    
    // Maximum particle counts to prevent performance issues
    MAX_TRAIL: 100,
    MAX_EXPLOSION: 50,
    MAX_SPARKLE: 30,
    MAX_CONFETTI: 100,
    
    // Create a new particle with the given properties
    createParticle(x, y, vx, vy, color, size, maxLife, rotation = 0, rotationSpeed = 0) {
        return {
            x,
            y,
            vx,
            vy,
            opacity: 1.0,
            life: maxLife,
            maxLife,
            color,
            size,
            rotation,
            rotationSpeed
        };
    },
    
    // Create trail particles at player position
    createTrailParticle(x, y) {
        // Enforce maximum particle count
        if (this.trailParticles.length >= this.MAX_TRAIL) {
            return;
        }
        
        // Random size variation between 8-12 pixels
        const size = 8 + Math.random() * 4;
        
        // Trail particles have no velocity (stationary)
        const vx = 0;
        const vy = 0;
        
        // Purple color with transparency
        const color = COLORS.purple;
        
        // Lifetime of 30 frames
        const maxLife = 30;
        
        // Initial opacity will be set to 0.6 in the particle
        const particle = this.createParticle(x, y, vx, vy, color, size, maxLife);
        particle.opacity = 0.6;
        
        this.trailParticles.push(particle);
    },
    
    // Create explosion effect at collision point
    createExplosion(x, y) {
        // Generate 15-20 particles for the explosion
        const particleCount = 15 + Math.floor(Math.random() * 6);
        
        // Limit total explosion particles
        const availableSlots = this.MAX_EXPLOSION - this.explosionParticles.length;
        const actualCount = Math.min(particleCount, availableSlots);
        
        for (let i = 0; i < actualCount; i++) {
            // Random angle for radiation effect
            const angle = Math.random() * Math.PI * 2;
            
            // Random magnitude between 2-5 pixels/frame
            const magnitude = 2 + Math.random() * 3;
            
            // Calculate velocity components
            const vx = Math.cos(angle) * magnitude;
            const vy = Math.sin(angle) * magnitude;
            
            // Random size between 4-8 pixels
            const size = 4 + Math.random() * 4;
            
            // Alternate between purple and light purple
            const color = Math.random() < 0.5 ? COLORS.purple : COLORS.purpleLight;
            
            // Lifetime of 60 frames
            const maxLife = 60;
            
            const particle = this.createParticle(x, y, vx, vy, color, size, maxLife);
            
            // Mark this as an explosion particle so we can apply gravity
            particle.isExplosion = true;
            
            this.explosionParticles.push(particle);
        }
    },
    
    // Create sparkle effect at obstacle gap center
    createSparkles(x, y) {
        // Generate 8-12 particles for the sparkle effect
        const particleCount = 8 + Math.floor(Math.random() * 5);
        
        // Limit total sparkle particles
        const availableSlots = this.MAX_SPARKLE - this.sparkleParticles.length;
        const actualCount = Math.min(particleCount, availableSlots);
        
        for (let i = 0; i < actualCount; i++) {
            // Random angle for sparkle spread
            const angle = Math.random() * Math.PI * 2;
            
            // Random magnitude between 1-3 pixels/frame
            const magnitude = 1 + Math.random() * 2;
            
            // Calculate velocity components
            const vx = Math.cos(angle) * magnitude;
            const vy = Math.sin(angle) * magnitude;
            
            // Random size between 3-6 pixels
            const baseSize = 3 + Math.random() * 3;
            
            // Bright colors: yellow and white
            const color = Math.random() < 0.5 ? '#FFD700' : '#FFFFFF';
            
            // Lifetime of 45 frames
            const maxLife = 45;
            
            const particle = this.createParticle(x, y, vx, vy, color, baseSize, maxLife);
            
            // Mark as sparkle particle for special behavior
            particle.isSparkle = true;
            particle.baseSize = baseSize;
            particle.twinklePhase = Math.random() * Math.PI * 2; // Random starting phase
            
            this.sparkleParticles.push(particle);
        }
    },
    
    // Create confetti effect for new high score
    createConfetti() {
        // Generate 30-40 particles for the confetti effect
        const particleCount = 30 + Math.floor(Math.random() * 11);
        
        // Limit total confetti particles
        const availableSlots = this.MAX_CONFETTI - this.confettiParticles.length;
        const actualCount = Math.min(particleCount, availableSlots);
        
        // Brand colors for confetti
        const confettiColors = [COLORS.purple, COLORS.purpleLight, '#FFFFFF'];
        
        for (let i = 0; i < actualCount; i++) {
            // Random x position across screen width
            const x = Math.random() * canvas.width;
            
            // Start above screen
            const y = -20;
            
            // Random horizontal velocity between -1 and 1
            const vx = (Math.random() - 0.5) * 2;
            
            // Random downward velocity between 2-4 pixels/frame
            const vy = 2 + Math.random() * 2;
            
            // Random size between 6-10 pixels
            const size = 6 + Math.random() * 4;
            
            // Random color from brand palette
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            
            // Lifetime of 180 frames
            const maxLife = 180;
            
            // Random initial rotation
            const rotation = Math.random() * Math.PI * 2;
            
            // Random rotation speed between 0.05-0.15 rad/frame
            const rotationSpeed = 0.05 + Math.random() * 0.1;
            
            const particle = this.createParticle(x, y, vx, vy, color, size, maxLife, rotation, rotationSpeed);
            
            // Mark as confetti particle for special behavior
            particle.isConfetti = true;
            
            this.confettiParticles.push(particle);
        }
    },
    
    // Update all particles
    update() {
        this.updateParticleArray(this.trailParticles);
        this.updateParticleArray(this.explosionParticles);
        this.updateParticleArray(this.sparkleParticles);
        this.updateParticleArray(this.confettiParticles);
    },
    
    // Update a single particle array
    updateParticleArray(particles) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Apply gravity to explosion particles
            if (particle.isExplosion) {
                particle.vy += 0.2; // Gravity constant for explosions
            }
            
            // Apply gravity and rotation to confetti particles
            if (particle.isConfetti) {
                particle.vy += 0.15; // Gravity constant for confetti
                particle.rotation += particle.rotationSpeed; // Update rotation
            }
            
            // Apply velocity decay to sparkle particles
            if (particle.isSparkle) {
                particle.vx *= 0.95;
                particle.vy *= 0.95;
                
                // Update twinkling animation
                particle.twinklePhase += 0.2;
                // Oscillate size between 0.5x and 1.5x base size
                particle.size = particle.baseSize * (1 + 0.5 * Math.sin(particle.twinklePhase));
            }
            
            // Update position based on velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Decrease lifetime
            particle.life--;
            
            // Update opacity based on remaining life
            // For trail particles, scale from initial 0.6 opacity
            const initialOpacity = particle.maxLife === 30 ? 0.6 : 1.0;
            particle.opacity = (particle.life / particle.maxLife) * initialOpacity;
            
            // Remove dead particles
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    },
    
    // Draw all particles
    draw(ctx) {
        this.drawParticleArray(ctx, this.trailParticles);
        this.drawParticleArray(ctx, this.explosionParticles);
        this.drawParticleArray(ctx, this.sparkleParticles);
        this.drawParticleArray(ctx, this.confettiParticles);
    },
    
    // Draw a single particle array
    drawParticleArray(ctx, particles) {
        for (const particle of particles) {
            // Validate particle position
            if (!isFinite(particle.x) || !isFinite(particle.y) || 
                !isFinite(particle.opacity)) {
                continue;
            }
            
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, particle.opacity));
            
            // Handle confetti particles as rotating rectangles
            if (particle.isConfetti) {
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, 
                    particle.size, particle.size);
            } else {
                // Draw as circle for other particles
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    },
    
    // Clear all particles
    clear() {
        this.trailParticles = [];
        this.explosionParticles = [];
        this.sparkleParticles = [];
        this.confettiParticles = [];
    }
};

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
    lastHighScore = highScore; // Reset to current high score for new game
    ParticleSystem.clear();
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
    
    // Generate trail particles at player position
    // Spawn 1-2 particles per frame for continuous trail
    if (Math.random() < 0.7) {
        ParticleSystem.createTrailParticle(
            player.x + player.width / 2, 
            player.y + player.height / 2
        );
    }
    
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
            
            // Create sparkle effect at gap center
            const sparkleX = obstacle.x + OBSTACLE_WIDTH / 2;
            const sparkleY = obstacle.topHeight + OBSTACLE_GAP / 2;
            ParticleSystem.createSparkles(sparkleX, sparkleY);
            
            // Check if new high score is achieved
            if (score > lastHighScore) {
                // Trigger confetti effect for new high score
                ParticleSystem.createConfetti();
                lastHighScore = score; // Update to prevent repeated confetti
            }
            
            // Update high score if exceeded
            if (score > highScore) {
                highScore = score;
                StorageManager.saveHighScore(highScore);
            }
        }
        
        // Remove off-screen obstacles
        if (obstacle.x + OBSTACLE_WIDTH < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update particle system
    ParticleSystem.update();
    
    // Check collisions
    checkCollisions();
}

// Check collisions
function checkCollisions() {
    // Ground and ceiling collision
    if (player.y + player.height > canvas.height || player.y < 0) {
        // Create explosion at collision point
        const explosionX = player.x + player.width / 2;
        const explosionY = player.y < 0 ? player.y : player.y + player.height;
        ParticleSystem.createExplosion(explosionX, explosionY);
        
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
                // Create explosion at collision point
                const explosionX = player.x + player.width / 2;
                const explosionY = player.y < obstacle.topHeight ? 
                    obstacle.topHeight : obstacle.bottomY;
                ParticleSystem.createExplosion(explosionX, explosionY);
                
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
    ctx.fillText('Flappy Kiro', canvas.width / 2, canvas.height / 2 - 80);
    
    // Display high score
    ctx.font = '24px sans-serif';
    ctx.fillStyle = COLORS.purple;
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 - 30);
    
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
    // Draw particle layer (before game objects)
    ParticleSystem.draw(ctx);
    
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
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.font = '28px sans-serif';
    ctx.fillStyle = COLORS.purple;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('Press SPACE or click to restart', canvas.width / 2, canvas.height / 2 + 100);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

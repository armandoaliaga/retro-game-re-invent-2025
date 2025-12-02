# Project Structure

## Root Files
```
├── index.html          # Entry point, canvas element, minimal styling
├── game.js             # Complete game implementation
├── kiro-logo.png       # Player character sprite
└── README.md           # Project documentation
```

## Code Organization (game.js)

### Constants Section
- Game physics parameters (gravity, jump power)
- Obstacle configuration (speed, spawn rate, dimensions)
- Kiro brand colors (purple-500, backgrounds, text colors)

### Game State
- `gameState` - Current state: 'start', 'playing', or 'gameOver'
- `score` - Current player score
- `frameCount` - Frame counter for obstacle spawning
- `player` - Player object with position, velocity, dimensions, sprite
- `obstacles` - Array of active obstacle objects

### Core Functions
- `handleInput()` - Keyboard and mouse input handling
- `resetGame()` - Initialize/reset game state
- `createObstacle()` - Spawn new obstacles with random heights
- `update()` - Game logic and physics updates
- `checkCollisions()` - Collision detection for player vs obstacles/boundaries
- `draw()` - Main rendering dispatcher
- `drawStartScreen()` - Start screen UI
- `drawGame()` - Active gameplay rendering
- `drawGameOverScreen()` - Game over overlay
- `gameLoop()` - Main game loop using requestAnimationFrame

## Styling Approach
- Inline CSS in `index.html` for simplicity
- Centered canvas with Kiro purple border and glow effect
- Dark background (#0a0a0a) for contrast

## Asset Management
- Images loaded via JavaScript Image objects
- Single sprite (kiro-logo.png) used for player character

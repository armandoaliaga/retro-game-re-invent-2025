# Technology Stack

## Core Technologies
- **HTML5 Canvas** - Rendering engine
- **Vanilla JavaScript** - Game logic and physics
- **CSS3** - Page styling and layout

## Architecture
- Single-page application with no build system
- Direct browser execution (no compilation required)
- Canvas 2D rendering context for all graphics

## Key Libraries
None - pure vanilla implementation

## Game Constants
- Gravity: 0.3
- Jump Power: -6
- Obstacle Speed: 1.5 px/frame
- Obstacle Spawn Rate: Every 180 frames
- Obstacle Gap: 150px
- Target Frame Rate: 60 FPS (via requestAnimationFrame)

## Assets
- `kiro-logo.png` - Player character sprite

## Running the Game
1. Open `index.html` in a web browser
2. No build or compilation step needed
3. For local development, use any static file server or open directly

## File Structure
- `index.html` - Entry point and canvas setup
- `game.js` - All game logic, physics, and rendering
- `kiro-logo.png` - Character sprite

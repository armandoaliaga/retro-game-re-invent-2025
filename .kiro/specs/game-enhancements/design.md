# Design Document: Game Enhancements

## Overview

This design extends the Flappy Kiro game with three major enhancement systems: a score persistence mechanism using browser Local Storage, a comprehensive particle effects system for visual feedback, and an audio system for sound effects and background music. The enhancements maintain the existing game architecture while adding new rendering layers, storage capabilities, and audio playback.

The score persistence system will track high scores across browser sessions, providing players with long-term progression feedback. The particle effects system will create four distinct visual effects (trails, explosions, sparkles, and confetti) that respond to game events. The audio system will provide immediate audio feedback through sound effects and create an immersive atmosphere with lofi background music during gameplay.

## Architecture

### High-Level Structure

The existing game architecture follows a simple game loop pattern with three main phases:
1. **Input Handling** - Processes user interactions
2. **Update** - Applies game logic and physics
3. **Draw** - Renders all visual elements

The enhancements will integrate into this architecture as follows:

```
Game Loop
├── Input Handling (existing)
│   └── Audio Manager (NEW) - trigger jump sound
├── Update Phase
│   ├── Player Physics (existing)
│   ├── Obstacle Management (existing)
│   ├── Collision Detection (existing)
│   │   └── Audio Manager (NEW) - trigger collision sound
│   ├── Score Update (existing)
│   │   └── Audio Manager (NEW) - trigger celebration sound on new high score
│   └── Particle System Update (NEW)
│       ├── Update Trail Particles
│       ├── Update Explosion Particles
│       ├── Update Sparkle Particles
│       └── Update Confetti Particles
├── Draw Phase
│   ├── Background (existing)
│   ├── Particle Layer (NEW) - drawn before game objects
│   ├── Game Objects (existing)
│   └── UI Layer (existing + enhanced with high score)
├── Storage Management (NEW)
│   ├── Load High Score on Init
│   └── Save High Score on Update
└── Audio Management (NEW)
    ├── Initialize Audio Context
    ├── Load Sound Effects
    ├── Load Background Music
    ├── Play/Stop Background Music on State Changes
    └── Play Sound Effects on Events
```

### Particle System Architecture

All particle effects will share a common particle structure and lifecycle management system:

```javascript
Particle {
  x, y          // Position
  vx, vy        // Velocity
  opacity       // Current opacity (0-1)
  life          // Remaining lifetime
  maxLife       // Initial lifetime
  color         // Particle color
  size          // Particle size
  rotation      // Current rotation (for confetti)
  rotationSpeed // Rotation velocity (for confetti)
}
```

## Components and Interfaces

### 1. Storage Manager

**Purpose**: Handles all Local Storage operations for score persistence.

**Interface**:
```javascript
StorageManager {
  loadHighScore(): number
  saveHighScore(score: number): void
  isStorageAvailable(): boolean
}
```

**Implementation Details**:
- Uses `localStorage.getItem('flappyKiroHighScore')` for retrieval
- Uses `localStorage.setItem('flappyKiroHighScore', score)` for persistence
- Implements try-catch error handling for storage unavailability
- Returns 0 as default high score if storage is unavailable or empty

### 2. Particle System Manager

**Purpose**: Manages all particle effects with a unified update and render pipeline.

**Interface**:
```javascript
ParticleSystem {
  trailParticles: Particle[]
  explosionParticles: Particle[]
  sparkleParticles: Particle[]
  confettiParticles: Particle[]
  
  createTrailParticle(x: number, y: number): void
  createExplosion(x: number, y: number): void
  createSparkles(x: number, y: number): void
  createConfetti(): void
  
  update(): void
  draw(ctx: CanvasRenderingContext2D): void
}
```

**Implementation Details**:
- Maintains four separate arrays for different particle types
- Each particle type has specific creation parameters and behaviors
- Update method iterates through all particle arrays, updating positions and removing dead particles
- Draw method renders all particles with appropriate blending and colors

### 3. Trail Particle Generator

**Purpose**: Creates continuous trail particles behind the Kiro character during flight.

**Behavior**:
- Spawns 1-2 particles per frame when game state is 'playing'
- Initial position: player's current (x, y) coordinates
- Initial velocity: (0, 0) - particles remain stationary
- Opacity: starts at 0.6, fades to 0 over 30 frames
- Color: Kiro purple (#790ECB) with transparency
- Size: 8-12 pixels (random variation)

### 4. Explosion Effect Generator

**Purpose**: Creates burst effect on collision events.

**Behavior**:
- Spawns 15-20 particles radiating from collision point
- Initial velocity: Random angles, magnitude 2-5 pixels/frame
- Applies gravity (0.2) to particles after creation
- Opacity: starts at 1.0, fades to 0 over 60 frames
- Colors: Mix of purple (#790ECB) and light purple (#9D4EDB)
- Size: 4-8 pixels (random variation)

### 5. Sparkle Effect Generator

**Purpose**: Creates celebratory sparkles when passing through obstacles.

**Behavior**:
- Spawns 8-12 particles at obstacle gap center
- Initial velocity: Random directions, magnitude 1-3 pixels/frame
- Particles slow down over time (velocity *= 0.95 per frame)
- Opacity: starts at 1.0, fades to 0 over 45 frames
- Colors: Bright yellow (#FFD700), white (#FFFFFF)
- Size: 3-6 pixels with twinkling effect (size oscillates)

### 6. Confetti Effect Generator

**Purpose**: Creates screen-wide confetti celebration for new high scores.

**Behavior**:
- Spawns 30-40 particles across screen width
- Initial position: Random x across canvas width, y = -20 (above screen)
- Initial velocity: (random -1 to 1, random 2-4) pixels/frame
- Applies gravity (0.15) to particles
- Rotation: Random initial rotation, rotation speed 0.05-0.15 rad/frame
- Opacity: starts at 1.0, fades to 0 over 180 frames
- Colors: Purple (#790ECB), light purple (#9D4EDB), white (#FFFFFF)
- Size: 6-10 pixels, rendered as rectangles

### 7. Audio Manager

**Purpose**: Manages all audio playback including sound effects and background music.

**Interface**:
```javascript
AudioManager {
  audioContext: AudioContext | null
  sounds: {
    jump: HTMLAudioElement | null
    collision: HTMLAudioElement | null
    celebration: HTMLAudioElement | null
  }
  backgroundMusic: HTMLAudioElement | null
  isAudioEnabled: boolean
  
  initialize(): void
  playJumpSound(): void
  playCollisionSound(): void
  playCelebrationSound(): void
  startBackgroundMusic(): void
  stopBackgroundMusic(): void
}
```

**Implementation Details**:
- Uses HTML5 Audio API for sound playback
- Implements try-catch error handling for audio loading failures
- Tracks audio enabled state to handle browsers that block autoplay
- Background music loops continuously using `loop` attribute
- Sound effects use separate Audio instances to allow overlapping playback
- Volume levels: sound effects at 0.5, background music at 0.3

**Audio Files**:
- `jump.mp3` or `jump.wav` - Short upward swoosh sound (100-200ms)
- `collision.mp3` or `collision.wav` - Impact/crash sound (200-300ms)
- `celebration.mp3` or `celebration.wav` - Positive chime/fanfare (500ms-1s)
- `background-music.mp3` - Lofi instrumental track (looping)

**Browser Compatibility**:
- Supports both MP3 and WAV formats for maximum compatibility
- Handles autoplay restrictions by enabling audio on first user interaction
- Gracefully degrades if audio context creation fails

## Data Models

### Particle Data Structure

```javascript
{
  x: number,              // X position in canvas coordinates
  y: number,              // Y position in canvas coordinates
  vx: number,             // X velocity in pixels per frame
  vy: number,             // Y velocity in pixels per frame
  opacity: number,        // Current opacity (0.0 to 1.0)
  life: number,           // Remaining lifetime in frames
  maxLife: number,        // Initial lifetime in frames
  color: string,          // CSS color string
  size: number,           // Particle size in pixels
  rotation?: number,      // Current rotation in radians (confetti only)
  rotationSpeed?: number  // Rotation velocity in radians/frame (confetti only)
}
```

### Game State Extensions

The existing game state will be extended with:

```javascript
{
  // Existing state
  gameState: 'start' | 'playing' | 'gameOver',
  score: number,
  frameCount: number,
  
  // New state
  highScore: number,
  lastHighScore: number,  // Track previous high score to detect new records
  particleSystem: ParticleSystem,
  audioManager: AudioManager
}
```

## Correctn
ess Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: High score persistence
*For any* score value that exceeds the current high score, updating the game score should result in the high score being saved to local storage with the new value.
**Validates: Requirements 1.2**

### Property 2: Trail particle positioning
*For any* player position, when a trail particle is created, the particle's initial position should match the player's current coordinates.
**Validates: Requirements 2.2**

### Property 3: Particle opacity decay
*For any* particle (trail, explosion, sparkle, or confetti), the particle's opacity should decrease monotonically over time until it reaches zero and is removed.
**Validates: Requirements 2.3, 3.4, 4.4**

### Property 4: Explosion location accuracy
*For any* collision event at coordinates (x, y), the explosion effect should be created with its center at those exact coordinates.
**Validates: Requirements 3.1**

### Property 5: Explosion particle radiation
*For any* explosion effect, all generated particles should have velocity vectors pointing away from the explosion center point.
**Validates: Requirements 3.2**

### Property 6: Physics application to particles
*For any* explosion or confetti particle, the particle's position should update each frame according to its velocity, and velocity should update according to gravity.
**Validates: Requirements 3.3, 5.3**

### Property 7: Brand color compliance
*For any* particle effect (explosion, sparkle, or confetti), all particle colors should be from the defined Kiro brand color palette.
**Validates: Requirements 3.5, 4.5, 5.5**

### Property 8: Sparkle creation on obstacle pass
*For any* obstacle pass event, a sparkle effect should be created at the center of the obstacle gap.
**Validates: Requirements 4.1**

### Property 9: Sparkle twinkling animation
*For any* sparkle particle, the particle size should oscillate over time to create a twinkling visual effect.
**Validates: Requirements 4.3**

### Property 10: Confetti trigger on new high score
*For any* score update where the new score exceeds the previous high score, a confetti effect should be triggered.
**Validates: Requirements 5.1**

### Property 11: Confetti screen distribution
*For any* confetti effect, the generated particles should be distributed across the full width of the screen.
**Validates: Requirements 5.2**

### Property 12: Confetti downward motion
*For any* confetti particle, the particle should start above the visible screen area and move downward due to gravity.
**Validates: Requirements 5.4**

### Property 13: Jump sound on player action
*For any* jump event initiated by the player, the audio manager should trigger the jump sound effect.
**Validates: Requirements 6.1**

### Property 14: Collision sound on impact
*For any* collision event between the player and obstacles or boundaries, the audio manager should trigger the collision sound effect.
**Validates: Requirements 6.2**

### Property 15: Celebration sound on new high score
*For any* score update where the new score exceeds the previous high score and confetti is triggered, the audio manager should play the celebration sound effect.
**Validates: Requirements 6.3**

### Property 16: Background music state synchronization
*For any* game state transition to 'playing', the background music should start playing, and for any transition from 'playing' to 'gameOver', the background music should stop.
**Validates: Requirements 7.1, 7.3**

### Property 17: Background music looping
*For any* duration while the game state is 'playing', the background music should continue playing in a continuous loop without gaps.
**Validates: Requirements 7.2**

## Error Handling

### Local Storage Errors

**Strategy**: Graceful degradation with try-catch blocks

**Implementation**:
- Wrap all `localStorage` operations in try-catch blocks
- On storage unavailability:
  - Log warning to console
  - Continue with in-memory high score (default 0)
  - Display high score as "N/A" or use in-memory value
- Test for storage availability on initialization using `isStorageAvailable()` helper

**Error Scenarios**:
1. Storage quota exceeded - catch and continue with current session only
2. Private browsing mode - storage may throw exceptions
3. Storage disabled by user - fall back to session-only tracking

### Particle System Errors

**Strategy**: Defensive programming with bounds checking

**Implementation**:
- Validate particle positions before rendering (check for NaN, Infinity)
- Cap maximum particle counts to prevent performance degradation:
  - Trail particles: max 100 active
  - Explosion particles: max 50 per explosion
  - Sparkle particles: max 30 per sparkle
  - Confetti particles: max 100 active
- Remove particles that move off-screen beyond a threshold
- Handle missing canvas context gracefully

### Audio System Errors

**Strategy**: Graceful degradation with user interaction fallback

**Implementation**:
- Wrap all audio operations in try-catch blocks
- On audio initialization failure:
  - Log warning to console
  - Set `isAudioEnabled` flag to false
  - Continue gameplay without audio
- Handle autoplay restrictions:
  - Detect autoplay blocking (common in modern browsers)
  - Enable audio on first user interaction (click or keypress)
  - Display optional "Enable Sound" indicator if audio is blocked
- On audio file loading failure:
  - Log specific file that failed to load
  - Continue with other audio that loaded successfully
  - Silently skip playback for missing audio files

**Error Scenarios**:
1. Audio context creation fails - continue without audio
2. Audio files fail to load (404, network error) - skip those specific sounds
3. Autoplay blocked by browser - enable on first user interaction
4. Audio playback throws exception - catch and continue gameplay
5. Background music fails to loop - attempt to restart on 'ended' event

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific behaviors and edge cases:

**Storage Manager Tests**:
- Test loading high score when storage is empty (should return 0)
- Test loading high score with existing value
- Test saving high score updates storage correctly
- Test storage unavailability handling (mock localStorage as undefined)

**Particle Creation Tests**:
- Test trail particle created at correct position
- Test explosion creates expected number of particles
- Test sparkle particles have random velocities
- Test confetti particles span screen width

**State Transition Tests**:
- Test trail particles stop generating on gameOver
- Test confetti triggers only on new high score (not on equal score)

**Audio Manager Tests**:
- Test audio initialization with available audio context
- Test audio initialization when audio context is unavailable
- Test jump sound plays on jump event
- Test collision sound plays on collision event
- Test celebration sound plays on new high score
- Test background music starts when game state changes to 'playing'
- Test background music stops when game state changes to 'gameOver'
- Test audio file loading failure handling

### Property-Based Testing Approach

Property-based tests will verify universal properties across many random inputs using **fast-check** (JavaScript property testing library).

**Configuration**: Each property test will run a minimum of 100 iterations with randomly generated inputs.

**Test Tagging**: Each property-based test will include a comment tag in this format:
```javascript
// Feature: game-enhancements, Property 1: High score persistence
```

**Property Test Coverage**:

1. **High Score Persistence Property** (Property 1)
   - Generate random score values
   - Verify scores exceeding high score are saved to storage
   - Verify scores below high score don't overwrite storage

2. **Trail Particle Positioning Property** (Property 2)
   - Generate random player positions
   - Create trail particles
   - Verify particle positions match player positions

3. **Particle Opacity Decay Property** (Property 3)
   - Generate random particles of all types
   - Simulate multiple frames
   - Verify opacity decreases monotonically

4. **Explosion Location Property** (Property 4)
   - Generate random collision coordinates
   - Create explosions
   - Verify explosion center matches collision point

5. **Explosion Radiation Property** (Property 5)
   - Create explosions at random points
   - Verify all particle velocities point away from center

6. **Physics Application Property** (Property 6)
   - Generate random particles with velocity
   - Simulate frame updates
   - Verify position changes match velocity and gravity

7. **Brand Color Compliance Property** (Property 7)
   - Generate all particle types
   - Verify all colors are in brand palette

8. **Sparkle Creation Property** (Property 8)
   - Generate random obstacle pass events
   - Verify sparkles created at gap center

9. **Sparkle Twinkling Property** (Property 9)
   - Generate sparkle particles
   - Simulate multiple frames
   - Verify size oscillates

10. **Confetti Trigger Property** (Property 10)
    - Generate random score updates
    - Verify confetti only triggers when exceeding high score

11. **Confetti Distribution Property** (Property 11)
    - Create confetti effects
    - Verify particles span screen width

12. **Confetti Motion Property** (Property 12)
    - Generate confetti particles
    - Verify initial y position is above screen
    - Verify downward velocity

13. **Jump Sound Trigger Property** (Property 13)
    - Generate random jump events
    - Verify jump sound is triggered for each event

14. **Collision Sound Trigger Property** (Property 14)
    - Generate random collision events
    - Verify collision sound is triggered for each event

15. **Celebration Sound Trigger Property** (Property 15)
    - Generate score updates that exceed high score
    - Verify celebration sound plays when confetti triggers

16. **Background Music State Property** (Property 16)
    - Generate random game state transitions
    - Verify music starts on transition to 'playing'
    - Verify music stops on transition from 'playing' to 'gameOver'

17. **Background Music Looping Property** (Property 17)
    - Simulate extended gameplay duration
    - Verify music continues looping without interruption

### Integration Testing

Integration tests will verify the complete feature working within the game:

- Test complete game session with score persistence
- Test all particle effects triggering during actual gameplay
- Test particle rendering performance with multiple effects active
- Test high score display on all game screens

## Implementation Notes

### Performance Considerations

1. **Particle Pooling**: Consider implementing object pooling for particles to reduce garbage collection pressure
2. **Particle Culling**: Remove particles that move far off-screen to prevent unbounded array growth
3. **Render Optimization**: Use `globalAlpha` for particle opacity instead of modifying color strings
4. **Frame Rate**: Target 60 FPS; if particle count causes drops, implement adaptive particle limits

### Browser Compatibility

- Local Storage is supported in all modern browsers (IE8+)
- Canvas 2D context is universally supported
- No polyfills required for target browsers

### Audio Asset Requirements

The implementation will require the following audio files:

**Sound Effects** (short, non-looping):
- `jump.mp3` / `jump.wav` - Upward swoosh or flap sound (100-200ms)
- `collision.mp3` / `collision.wav` - Impact or crash sound (200-300ms)
- `celebration.mp3` / `celebration.wav` - Positive chime or fanfare (500ms-1s)

**Background Music** (looping):
- `background-music.mp3` - Lofi instrumental track (2-3 minutes, seamless loop)

**Audio Specifications**:
- Format: MP3 (primary) with WAV fallback for compatibility
- Sample rate: 44.1kHz
- Bit rate: 128kbps for music, 96kbps for sound effects
- Channels: Stereo for music, mono acceptable for sound effects
- Volume normalization: -14 LUFS for music, -12 LUFS for sound effects

### Future Enhancements

Potential future improvements not in current scope:
- Particle textures instead of solid colors
- Particle physics variations (wind, turbulence)
- Particle effect customization settings
- Additional particle types (smoke, stars, etc.)
- Volume controls for music and sound effects
- Audio mute toggle button
- Additional background music tracks with selection
- Spatial audio effects (panning based on position)

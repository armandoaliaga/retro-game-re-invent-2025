# Implementation Plan

- [x] 1. Implement score persistence system
  - Create storage manager functions for loading and saving high score
  - Add high score state variable to game
  - Load high score on game initialization
  - Update high score when current score exceeds it
  - Add error handling for unavailable local storage
  - Display high score on start screen and game over screen
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for high score persistence
  - **Property 1: High score persistence**
  - **Validates: Requirements 1.2**

- [x] 2. Create particle system foundation
  - Define particle data structure
  - Create particle system manager with arrays for each particle type
  - Implement particle update logic (position, velocity, opacity, lifetime)
  - Implement particle removal when lifetime expires
  - Integrate particle system update into main game loop
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 2.1 Write property test for particle opacity decay
  - **Property 3: Particle opacity decay**
  - **Validates: Requirements 2.3, 3.4, 4.4**

- [ ]* 2.2 Write property test for physics application
  - **Property 6: Physics application to particles**
  - **Validates: Requirements 3.3, 5.3**

- [x] 3. Implement trail particle effect
  - Create trail particle generator function
  - Spawn trail particles at player position during playing state
  - Configure trail particle properties (color, size, opacity, lifetime)
  - Stop trail generation when game state changes to gameOver
  - Render trail particles before player in draw phase
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 3.1 Write property test for trail particle positioning
  - **Property 2: Trail particle positioning**
  - **Validates: Requirements 2.2**

- [x] 4. Implement explosion particle effect
  - Create explosion generator function
  - Trigger explosion on collision events
  - Generate particles radiating outward from collision point
  - Apply gravity to explosion particles
  - Configure explosion particle properties (colors from brand palette, size, lifetime)
  - Render explosion particles in particle layer
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for explosion location accuracy
  - **Property 4: Explosion location accuracy**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Write property test for explosion particle radiation
  - **Property 5: Explosion particle radiation**
  - **Validates: Requirements 3.2**

- [ ]* 4.3 Write property test for brand color compliance
  - **Property 7: Brand color compliance**
  - **Validates: Requirements 3.5, 4.5, 5.5**

- [x] 5. Implement sparkle particle effect
  - Create sparkle generator function
  - Trigger sparkles when player passes through obstacle gap
  - Generate sparkle particles with random velocities at gap center
  - Implement twinkling animation (oscillating size)
  - Configure sparkle particle properties (bright colors, size, lifetime)
  - Render sparkle particles in particle layer
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.1 Write property test for sparkle creation on obstacle pass
  - **Property 8: Sparkle creation on obstacle pass**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for sparkle twinkling animation
  - **Property 9: Sparkle twinkling animation**
  - **Validates: Requirements 4.3**

- [x] 6. Implement confetti particle effect
  - Create confetti generator function
  - Trigger confetti when current score exceeds high score
  - Generate confetti particles distributed across screen width
  - Start confetti particles above screen with downward velocity
  - Apply gravity and rotation to confetti particles
  - Configure confetti particle properties (multiple brand colors, size, lifetime)
  - Render confetti particles as rotating rectangles
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 6.1 Write property test for confetti trigger on new high score
  - **Property 10: Confetti trigger on new high score**
  - **Validates: Requirements 5.1**

- [ ]* 6.2 Write property test for confetti screen distribution
  - **Property 11: Confetti screen distribution**
  - **Validates: Requirements 5.2**

- [ ]* 6.3 Write property test for confetti downward motion
  - **Property 12: Confetti downward motion**
  - **Validates: Requirements 5.4**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
